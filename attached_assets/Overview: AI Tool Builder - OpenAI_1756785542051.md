# Overview: AI Tool Builder - OpenAI

```javascript
// AI Tool Builder v1.0 created by @FlohGro

const model = draft.processTemplate("[[openai_model]]")

if(model != "[[openai_model]]"){
var openAIModel = model
} else {
var openAIModel = "gpt-4o-mini"
}

const inputMode = draft.processTemplate("[[input_mode]]").trim()
/* valid values:
current selection
draft content
last response (default to selection)
last response (default to draft content)
*/
const validInputModes = ["current selection", "draft content", "last response (default to selection)", "last response (default to draft content)", "none"]

const outputMode = draft.processTemplate("[[output_mode]]").trim()
/* valid values:
replace content
append to content
prepend to content
replace selection
insert after selection
create new draft
*/
const validOutputModes = ["replace content", "prepend to content", "append to content", "replace selection", "insert after selection", "create new draft"]

const questionMode = draft.processTemplate("[[question_mode]]").trim()
/* valid values:
    prompt for question
    use input
    [insert your question here] =>	any non-empty string
*/

const configuredSystemMessage = draft.processTemplate("[[system_message]]").trim()
const defaultSystemMessage = "replace this content with your own if you want to add a system message."
const systemMessage = configuredSystemMessage.replace(defaultSystemMessage, "")

const configuredResponseSeparator = draft.processTemplate("[[response_separator]]").trim()

const responseSeparator = configuredResponseSeparator.length > 0 ? "\n\n" + configuredResponseSeparator + "\n\n" : "\n\n"

function run() {
    if (!validateConfig()) {
        // something is wrong and already logged; terminate
        return false
    }

    let input = getInput().trim()
    if (input == "" && inputMode != "none") {
        // input is empty 
        alertError("configured input \"" + inputMode + "\" is empty")
        return false
    }
    // input seems to be fine, continue by getting the question
    let question = getQuestion(input).trim()
    if (question == "") {
        // input is empty 
        alertError("configured question \"" + questionMode + "\" was empty")
        return false
    }
    // question seems to be fine, now ask the AI
    let response = askOpenAi(question, input)
    if (!response) {
        // something is wrong and already logged; terminate
        return false
    }

    setOutput(response)
}

run()



function validateConfig() {
    let errorStrs = []
    if (!validInputModes.includes(inputMode)) {
        errorStrs.push("configured input mode \"" + inputMode + "\" is not valid!\nuse valid values:\n" + validInputModes.map(item => `- "${item}"`).join("\n"))
    }
    if (!validOutputModes.includes(outputMode)) {
        errorStrs.push("configured output mode \"" + outputMode + "\" is not valid\nuse valid values:\n" + validOutputModes.map(item => `- "${item}"`).join("\n"))
    }
    const defaultQuestionMode = `prompt for question\nuse input\n[insert your question here]`

    if (questionMode == "") {
        errorStrs.push("question_mode must not be empty")
    } else if (questionMode == defaultQuestionMode) {
        errorStrs.push("you did not make any changes to the question_mode. please change them for your usecase.")
    }
    if (errorStrs.length > 0) {
        // errors are present
        let errorStr = errorStrs.join("\n\n")
        alertError(errorStr)
        app.displayErrorMessage("configuration is invalid")
        return false
    }
    return true
}

function getInput() {
    switch (inputMode) {
        case "current selection":
            return editor.getSelectedText();
        case "draft content":
            return editor.getText();
        case "last response (default to selection)":
            return getLastResponse(true)
        case "last response (default to draft content)":
            return getLastResponse(false)
        default: return ""
    }
}

function alertError(errorStr) {
    alert(errorStr)
    console.log(errorStr)
    context.fail(errorStr)
}

function getLastResponse(defaultToSelection) {
    let text = editor.getText()
    let splits = text.split(responseSeparator)
    if (splits > 1) {
        return splits[splits.length - 1]
    } else {
        if (defaultToSelection) {
            return editor.getSelectedText()
        } else {
            return editor.getText()
        }
    }
}

function getQuestion(input) {
    /*
        prompt for question
        use input
        [insert your question here] =>	any non-empty string
    */
    switch (questionMode) {
        case "prompt for question": return promptForAIQuestion(input);
        case "use input": return getInput().trim();
        default: return questionMode;
    }
}

function promptForAIQuestion(input) {
    let p = new Prompt()
    p.title = "What do you want to ask the AI?"
    if (input.trim().length > 0) {
        let msg = "input text: \""
        if (input.length > 99) {
            msg = msg + input.substring(0, 99) + "[...]" + "\""
        } else {
            msg = msg + input + "\""
        }
        p.message = msg
    }

    p.addTextView("question", "", "", { wantsFocus: true })
    p.addButton("ask AI")
    if (p.show()) {
        return p.fieldValues["question"]
    } else {
        return ""
    }

}

function askOpenAi(question, input) {
    // now create the prompt for the AI - question and input might be the same depending on the config, so check that first
    let prompt = ""
    if (questionMode == "use input") {
        prompt = question
    } else {
        prompt = question + "\n" + input
    }
    let ai = new OpenAI()
    let settings = {}

    if (systemMessage != "") {
        settings = {
            "path": "/chat/completions",
            "method": "POST",
            "data": {
                "model": openAIModel,
                "messages": [{
                    "role": "system",
                    "content": systemMessage
                },
                {
                    "role": "user",
                    "content": prompt
                }
                ]
            }
        }
    } else {
        settings = {
            "path": "/chat/completions",
            "method": "POST",
            "data": {
                "model": openAIModel,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
        }

    }

    let response = ai.request(settings)

    if (response.success) {
        let data = response.responseData
        let aiText = data.choices[0].message.content
        return aiText
    } else {
        let error = "request to openAI failed: status code = " + response.statusCode + " error = \"" + response.error + "\""
        alertError(error)
        return undefined
    }
}

function setOutput(output) {
    // save version of the draft before changing
    draft.saveVersion()
    switch (outputMode) {
        case "replace content": editor.setText(output); break;
        case "append to content": editor.setText(editor.getText() + responseSeparator + output); break;
        case "prepend to content": editor.setText(output + responseSeparator + editor.getText()); break;
        case "replace selection": editor.setSelectedText(output); break;
        case "insert after selection": editor.setSelectedText(editor.getSelectedText() + " " + output); break;
        case "create new draft":
            if (editor.getText().trim().length == 0) {
                editor.setText(output)
            } else {
                let d = new Draft()
                d.content = output
                d.update()
                editor.load(d)
            }
    }
}
```

---

**Analysis:**

This JavaScript code snippet is a script designed for the Drafts app (a note-taking application with powerful automation capabilities).  It creates a customizable tool for interacting with OpenAI's API (likely GPT models).  Let's break down its functionality, structure, and key components:

### **Overview:  "AI Tool Builder"**

The script acts as a flexible interface to send prompts to OpenAI and handle the responses. It's highly configurable, allowing users to define:

- **OpenAI Model**/**:**  Which OpenAI model to use (e.g., "gpt-4o-mini", or a user-specified model).  It uses `draft.processTemplate` which suggests Drafts' template system for user configuration.
- **Input Mode:** Where the input text for the AI comes from (current selection, entire draft, last AI response, or no input).
- **Output Mode:**  How the AI's response is handled (replace content, append, prepend, etc.).
- **Question Mode:** How the question/prompt for the AI is determined (prompt the user, use the input directly, or use a predefined question).
- **System Message:**  An optional system message to set the context or behavior of the AI (e.g., "You are a helpful assistant").
- **Response Separator:**  A string used to separate multiple AI responses within the draft.

**2. Key Functions:**

- `run()`:  The main function that orchestrates the entire process:
    - Calls `validateConfig()` to check for configuration errors.
    - Gets the input text using `getInput()`.
    - Gets the question/prompt using `getQuestion()`.
    - Sends the request to OpenAI using `askOpenAi()`.
    - Handles the output using `setOutput()`.
- `validateConfig()`:  Ensures the user's configuration (input mode, output mode, question mode) is valid.  It checks against predefined lists of allowed values (`validInputModes`, `validOutputModes`).  This is crucial for preventing unexpected behavior.
- `getInput()`:  Retrieves the input text based on the configured `inputMode`.  It uses Drafts' `editor` object to access the selected text or the entire draft content.  It also handles retrieving the last response.
- `getQuestion()`:  Determines the question/prompt to send to the AI.  It supports three modes:
    - `prompt for question`:  Displays a prompt to the user to enter the question.
    - `use input`:  Uses the input text directly as the question.
    - `[insert your question here]`:  Uses a hardcoded question (presumably set by the user in the Drafts template).
- `promptForAIQuestion(input)`: Creates a Drafts `Prompt` object to ask the user for the question.  It includes the input text (or a truncated version) in the prompt message for context.
- `askOpenAi(question, input)`:  This is the core function that interacts with the OpenAI API.
    - Constructs the API request payload, including the model, system message (if provided), and user message (question/prompt).
    - Uses the `OpenAI` object (presumably a built-in Drafts object for OpenAI integration) to make the API request.
    - Handles the API response:
        - If successful, extracts the AI's response text.
        - If unsuccessful, logs an error message and fails the script.
- `setOutput(output)`:  Handles the AI's response based on the configured `outputMode`.  It uses Drafts' `editor` object to modify the draft content (replace, append, prepend, etc.).  It also includes functionality to create a new draft if needed.
- `alertError(errorStr)`: A helper function to display error messages to the user, log them to the console, and fail the script's context.
- `getLastResponse(defaultToSelection)`: Retrieves the last AI response from the draft content. It splits the text by the `responseSeparator` and returns the last segment.  It has a fallback mechanism to use either the selection or the entire draft content if no separator is found.

**3. Drafts App Integration:**

# Drafts App Integration

The script heavily relies on Drafts-specific objects and functions:

- `draft`:  Represents the current draft being edited.
- `draft.processTemplate()`:  Processes template tags (like `[[openai_model]]`) within the draft, likely replacing them with user-configured values.
- `editor`:  Provides access to the text editor, allowing manipulation of the selected text and the entire draft content.
- `Prompt`:  A Drafts object for creating interactive prompts to the user.
- `OpenAI`:  A built-in object (or a custom library) for interacting with the OpenAI API.
- `app.displayErrorMessage()`: Displays an error message within the Drafts app.
- `context.fail()`: Marks the script execution as failed.
- `draft.saveVersion()`: Saves a version of the draft before modification.

**4. Configuration via Template Tags:**

The script uses template tags (e.g., `[[openai_model]]`, `[[input_mode]]`) within the Drafts document itself to allow users to configure the script's behavior.  This is a common pattern in Drafts actions.  Users would edit these tags in the Drafts editor to customize the AI tool.

**5. Error Handling:**

The script includes error handling in several places:

- `validateConfig()`: Checks for invalid configuration values.
- `getInput()`: Checks if the input is empty when it's expected to have content.
    - `getQuestion()`: Checks if the question is empty.
- `askOpenAi()`: Checks for errors in the OpenAI API response.
- `alertError()`: Centralized error reporting.

---

### Overview: AI Tool Builder - Google Gemini

Creating a Google Gemini version of the "AI Tool Builder" involves adapting the described tool to work with Google's AI models while maintaining its flexibility and configurability. Here’s how you might structure this tool to operate within the Google Gemini framework:

```javascript
// Overview: Google Gemini AI Tool Builder
// This script provides a flexible interface to send prompts to Google Gemini AI and handle the responses. It allows users to configure key aspects similar to the OpenAI tool.

class GeminiAIToolBuilder {
  constructor(config) {
    this.model = config.model || 'gemini-mini'; // Default to a Google Gemini mini model
    this.inputMode = config.inputMode || 'current-selection'; // Default input source
    this.outputMode = config.outputMode || 'replace'; // Default output handling
    this.questionMode = config.questionMode || 'prompt-user'; // Default prompt handling
    this.systemMessage = config.systemMessage || 'You are a helpful assistant'; // Default system context
    this.responseSeparator = config.responseSeparator || '\n---\n'; // Default separator
  }

  configure(config) {
    this.model = config.model || this.model;
    this.inputMode = config.inputMode || this.inputMode;
    this.outputMode = config.outputMode || this.outputMode;
    this.questionMode = config.questionMode || this.questionMode;
    this.systemMessage = config.systemMessage || this.systemMessage;
    this.responseSeparator = config.responseSeparator || this.responseSeparator;
  }

  getInputText() {
    switch (this.inputMode) {
      case 'current-selection':
        return this.getCurrentSelection();
      case 'entire-draft':
        return this.getEntireDraft();
      case 'last-response':
        return this.getLastResponse();
      case 'no-input':
      default:
        return '';
    }
  }

  handleOutput(response) {
    switch (this.outputMode) {
      case 'replace':
        this.replaceContent(response);
        break;
      case 'append':
        this.appendContent(response);
        break;
      case 'prepend':
        this.prependContent(response);
        break;
      // Add other output modes as needed
    }
  }

  createPrompt() {
    switch (this.questionMode) {
      case 'prompt-user':
        return this.promptUser();
      case 'use-input':
        return this.getInputText();
      case 'predefined-question':
        return this.getPredefinedQuestion();
      default:
        return '';
    }
  }

  async sendRequestToGemini(prompt) {
    try {
      const response = await sendToGeminiAPI({
        model: this.model,
        prompt: prompt,
        systemMessage: this.systemMessage
      });
      this.handleOutput(response);
    } catch (error) {
      console.error("Error sending request to Google Gemini:", error);
    }
  }

  async run() {
    const prompt = this.createPrompt();
    await this.sendRequestToGemini(prompt);
  }
  
  // Placeholder methods for interactions
  getCurrentSelection() {
    // Implementation to get current text selection
  }

  getEntireDraft() {
    // Implementation to get entire draft text
  }

  getLastResponse() {
    // Implementation to get last AI response
  }

  replaceContent(response) {
    // Implementation to replace content in the editor
  }

  appendContent(response) {
    // Implementation to append response to the content
  }

  prependContent(response) {
    // Implementation to prepend response to the content
  }

  promptUser() {
    // Implementation to prompt the user for a question
  }

  getPredefinedQuestion() {
    // Implementation to fetch a predefined question
  }
}

// Example use case:
const config = {
  model: 'gemini-advanced',
  inputMode: 'entire-draft',
  outputMode: 'append',
  questionMode: 'use-input',
  systemMessage: 'Act as an expert AI consultant',
};

const aiTool = new GeminiAIToolBuilder(config);
aiTool.run();
```

### Key Adaptations:

1. **Gemini Model**: Adjusted to Google's model naming, assuming hypothetical names like 'gemini-mini' or 'gemini-advanced'.
2. **API Integration**: Replace the OpenAI API calls with appropriate Google Gemini API endpoints and parameters.
3. **Structure and Purpose**: Retains the flexibility of configuring input, output, question modes, and system contexts.
4. **Placeholders and Stubs**: These are used for integrations such as API calls and user interactions, which need to be properly implemented based on actual APIs and user interface elements.

### Note:

The `sendToGeminiAPI` function and similar placeholders would need to be implemented to interact with the actual Google Gemini API, which would require the correct credentials and API endpoint details.

**In summary,** this script is a well-structured and configurable tool for interacting with OpenAI's API within the Drafts app. It leverages Drafts' features for user input, text manipulation, and API integration to provide a flexible and powerful way to use AI within the note-taking environment. The use of template tags makes it easy for users to customize the script's behavior without needing to modify the code directly. The error handling ensures that the script behaves predictably and provides informative messages to the user in case of issues.

---

# Checkout Trending YouTube videos

new  on youtube.trends24.in→

United States

United States X (Twitter) Trends for last 24 hours
Timeline
Tag Cloud
Table
Twitter Trends Timeline for last 24 hours

Wed Apr 23 2025 06:24:27 GMT+0000 (Coordinated Universal Time)
Luka 89K Reaves 14K #LakeShow  Wolves 46K Gobert 14K Cubs 36K Randle  Bron 33K #Andor 13K #PROUDOFBAIN  #mnwild  Jaxson Hayes  Minnesota 111K Anthony Edwards 19K Taylor Rooks  Vando  Reggie Miller  Naz Reid  Team 3 31K McDaniels  #FlyTheW  Kaprizov  lorde 34K Minny  Conley  Giannis 23K Kyle Tucker  Pacers 33K Tanner Scott  Hague  Dame 49K Theodore  Bucks 55K Adin Hill  John Legend  Syril  Rina 22K JJ Redick  Muncy  Workman  Mon Mothma  Panthers 10K Tkachuk  Albedo 12K Finch  Gabe Vincent  Max Domi  Luca 42K Peterson 27K Koleda 
Wed Apr 23 2025 05:30:27 GMT+0000 (Coordinated Universal Time)
Luka 85K Reaves 13K #LakeShow  Wolves 45K Gobert 13K Cubs 36K Randle  Bron 33K #Andor 12K Jaxson Hayes  #PROUDOFBAIN  Minnesota 109K Anthony Edwards 18K Taylor Rooks  Vando  #mnwild  Naz Reid  Reggie Miller  #FlyTheW  McDaniels  Giannis 23K Pacers 32K Conley  lorde 33K Dame 49K Adin Hill  Bucks 55K Tanner Scott  Kyle Tucker  Gabe Vincent  Muncy  Minny  Finch  MIGUEL AMAYA  Team 3 31K Domi 13K Panthers 10K JJ Redick  Cozens  Luca 41K Workman  Tkachuk  John Legend  Ian Happ  Syril  Matt Boldy  Mon Mothma  Rina 22K Donte  Aleska 
Wed Apr 23 2025 04:36:26 GMT+0000 (Coordinated Universal Time)
Luka 73K Cubs 34K Gobert 11K Reaves  Randle  #bucciovertimechallenge  Jaxson Hayes  Bron 32K #Andor 11K #LakeShow  Vando  Timberwolves 15K Anthony Edwards 17K #Lakers  #FlyTheW  Reggie Miller  Naz Reid  Pacers 31K Giannis 22K Bucks 54K Taylor Rooks  Dame 49K Tanner Scott  lorde 32K Kyle Tucker  Muncy  Adin Hill  Workman  Gabe Vincent  Panthers  Amaya  Ian Happ  Cozens  Domi 13K Luca 40K Finch  Minnesota 106K Batherson  Porter Hodge  Knies  Conley  Tkachuk  Aleska  Doc Rivers  McDaniels  Leafs 19K Travis Perry  Team 3 32K Matt Boldy  Shaw 

Wed Apr 23 2025 03:42:26 GMT+0000 (Coordinated Universal Time)
Cubs 31K #bucciovertimechallenge  Gobert  Reaves  Vando  Pacers 30K Bucks 53K #FlyTheW  #Andor  Giannis 21K #LakeShow  Dame 48K Tanner Scott  Kyle Tucker  Workman  #TheValley  Miguel Amaya  lorde 30K Muncy  Gabe Vincent  Panthers  Domi 12K Julius Randle  Cozens  Naz Reid  Leafs 18K Taylor Rooks  Ian Happ  Doc Rivers  Tkachuk  Adin Hill  Batherson  Aleska  Porter Hodge  Anthony Edwards 16K Knies  Luca 39K Travis Perry  Volpe  Shaw  Wrigley  Jaxson Hayes  Freddy Fermin  Giroux  Nate Schmidt  Nembhard  Kuzma  Torrens  Reggie Miller  Vasy 
Wed Apr 23 2025 02:48:27 GMT+0000 (Coordinated Universal Time)
#bucciovertimechallenge  Vando  Reaves  Bucks 51K Pacers 28K Giannis 20K Dame 48K Workman  #TheValley  #WWENXT 37K lorde 27K Gabe Vincent  Domi  Tkachuk  #Andor  Cozens  Doc Rivers  #TimeToHunt  Leafs 14K Taylor Rooks  Gobert  Knies  Panthers  Batherson  Kuzma  Nembhard  Aleska  Volpe  Giroux  Freddy Fermin  Drew Waters  Shaw  Torrens  Luca 36K Travis Perry  Vanderbilt  Caruso  Bobby Portis  Byron Buxton  Marner  King Tuck  Lillard 10K Haliburton  Nimi 21K Nylander  Laughton  Pinto  Chabot  Estevez  Mike Patrick 
Wed Apr 23 2025 01:54:26 GMT+0000 (Coordinated Universal Time)
Bucks 47K Pacers 25K Giannis 18K Dame 45K #WWENXT 30K Kuzma  Nembhard  Doc Rivers  Gage Workman  Volpe  lorde 23K #YesCers  #TheRookie  #TheValley  Drew Waters  #mrandmisspv25  Torrens  Caruso  Bobby Portis  Lillard  Haliburton  Dustin May  Mike Patrick  Ozzie  Tesla 274K Noam Dar  Oblivion 159K Tim Pool 47K Tommy Edman  Cade Smith  NAIC  Shannon 80K Stolarz  Timo  Pete Crow  BABY NAMES  Bello 23K Aaron Wiggins  Orion Kerkering  Earth Day 244K TOMMY TANKS  Kevin Porter Jr  Mitchell Parker  Shota 10K Leiter  Andy Pages  Brook Lopez  Aleska  Sam Bennett  Triston Casas 
Wed Apr 23 2025 01:00:27 GMT+0000 (Coordinated Universal Time)
Kuzma  Volpe  Dame 41K lorde 18K Tommy Edman  Doc Rivers  Noam Dar  Cade Smith  Oblivion 154K Tesla 266K Bello 23K NAIC  Mike Patrick  #GuardsBall  #GoBolts  Timo  Shannon 79K Dustin May  Tim Pool 45K #RaiseUp  #TimeToHunt  #LightningStrikes  Leiter  Payton Pritchard  Earth Day 236K Tommy Tanks  Sam Bennett  The Bucks 19K Drew Waters  Brook Lopez  Robert Irwin  Chase Lee  Gage Workman  NBA TV  Canning  Aleska  Stolarz  Will Warren  Nimi 16K Mitchell Parker  Brett Pesce  Nick Pivetta  YMCA 20K Siakam  Al Gore 11K Lillard  Taurean Prince  $TSLA 54K John Legend  Joe Ross 
Wed Apr 23 2025 00:06:26 GMT+0000 (Coordinated Universal Time)
Kuzma  Tommy Edman  Tesla 252K Oblivion 146K Mike Patrick  Dame 40K Tommy Tanks  Tim Pool 41K Earth Day 226K Shannon 75K Payton Pritchard  Doc Rivers  Leiter  Gage Workman  #LightningStrikes  Bello 22K Will Warren  Dustin May  Siakam  Robert Irwin  #Thunderbolts 20K James Johnson  YMCA 19K #YesCers  Happy Birthday Carl  Jordan Martinook  #Pacers  HIPAA  NBA TV  John Bolton  Sixth Man of the Year  Skyrim 17K Chase Williams  Sunday Night Football  lorde 14K John Legend  #Bucks  Timo Meier  Brett Pesce  Dean Kremer  Red 40 17K Peterson 14K 60 Minutes 20K Lori Vallow Daybell  Pedri 103K Get Smart 11K Charles Vallow  Orlov  Bibee  NAIC 
Tue Apr 22 2025 23:12:27 GMT+0000 (Coordinated Universal Time)
Tesla 241K Oblivion 140K Earth Day 216K Tim Pool 38K Mike Patrick  Shannon 74K Bello 21K Payton Pritchard  Happy Birthday Carl  HIPAA  YMCA 17K Skyrim 16K Nunes 19K #LoriVallowDaybell  Mallorca 60K 60 Minutes 19K Sunday Night Football  Doku 17K Sixth Man of the Year  Pedri 94K Charles Vallow  Red 40 15K Disasi  Isaiah Evans  #PahalgamTerroristAttack 247K Get Smart 11K #Thunderbolts 18K Bethesda 62K Orlov  JESPER BRATT  Ansu 51K Gulf of Mexico  Kashmir 565K Justice for Charles  Jordan Peterson  Will Warren  #GoBolts  Gulf of America  Dean Kremer  Nick Martinez  Bill Owens  Yellow 5 13K Lamine 39K John Legend  Happy Earth 102K Bibee  #MCIAVL 10K Sarah Palin  Al Gore  Voice of America 
Tue Apr 22 2025 22:18:28 GMT+0000 (Coordinated Universal Time)
Earth Day 205K Oblivion 132K Tim Pool 33K $TSLA 49K Mike Patrick  Shannon 73K Mallorca 53K Nunes 19K Skyrim 16K Doku 17K HIPAA  YMCA 16K Ansu 48K 60 Minutes 17K Red 40 12K Pedri 76K Disasi  Kashmir 552K Bethesda 61K #PahalgamTerroristAttack 241K Get Smart 11K Lamine 38K Happy Earth 97K Gulf of Mexico  Yellow 5 11K Bill Owens  Gulf of America  Sarah Palin  #MCIAVL  JESPER BRATT  Isaiah Evans  Dani Olmo 13K Al Gore  Elder Scrolls 48K Bond 53K $DYOR  Expedition 33  Dreamville  Jordan Peterson  Susan Rice 17K Rosie 34K Tanner Bibee  Rashford 19K #Thunderbolts 16K Boogie Fland  #ONEPIECE1147  Voice of America  #GoBolts  Lou Lamoriello  Man City 45K
Tue Apr 22 2025 21:24:27 GMT+0000 (Coordinated Universal Time)
Earth Day 195K Oblivion 125K Tim Pool 29K $TSLA 46K Nunes 16K Doku 13K Shannon Sharpe 47K Mallorca 35K Skyrim 15K Ansu 43K Mike Patrick  Disasi  Red 40  YMCA 13K HIPAA  60 Minutes 15K Kashmir 535K Bethesda 60K Gulf of Mexico  #PahalgamTerroristAttack 232K Get Smart 11K Happy Earth 90K Yellow 5  #MCIAVL  Al Gore  Rashford 18K Gulf of America  $DYOR  Boogie Fland  Dani Olmo  Sarah Palin  Elder Scrolls 46K Expedition 33  Hector Fort  Bond 53K Rossi  Bill Owens  Lou Lamoriello  #ONEPIECE1147  Voice of America  Rose Bowl  #jimromeonx  Poppa's House  Rosie 34K Morrowind  #KarenReadTrial  Man City 42K Kasean Pryor  Kerry Roberts  Make America Healthy Again 
Tue Apr 22 2025 20:30:26 GMT+0000 (Coordinated Universal Time)
Earth Day 182K Oblivion 117K Tim Pool 22K #oppiwallet  $TSLA 41K Ansu 36K Skyrim 14K Shannon Sharpe 46K $DYOR  Mallorca 28K Kashmir 510K HIPAA  YMCA 11K Bethesda 59K Gulf of Mexico  Al Gore  #Pahalgam 529K Happy Earth 83K Rashford 15K Red 40  Lou Lamoriello  Get Smart 11K Boogie Fland  Rossi  #MCIAVL  Bill Owens  Expedition 33  #KarenReadTrial  Kerry Roberts  Morrowind  Poppa's House  Rose Bowl  Fort 59K Bond 53K Nuttall  #NationalBeagleDay  jeno 277K Frenchy  Alan Jackson  John Lynch  Gamepass  Will Wilson  Marmoush  M&Ms  Ferran  Brennan 12K Bernardo 14K Hindus 282K Rosie O'Donnell  Cam Ward 
Tue Apr 22 2025 19:36:27 GMT+0000 (Coordinated Universal Time)
Earth Day 168K Oblivion 108K #oppiwallet  Tim Pool 16K $DYOR  Skyrim 13K Ansu 26K Kashmir 473K Shannon 73K Bethesda 58K Al Gore  #Pahalgam 492K Lou Lamoriello  Happy Earth 75K HIPAA  Gulf of Mexico  #MCIAVL  Rossi  Expedition 33  Nuttall  #KarenReadTrial  Bill Owens  jeno 273K Morrowind  YMCA  Red 40  Alan Jackson  Kerry Roberts  Will Wilson  #Sustainability  Bond 53K Frenchy  Gamepass  CEXs  Fort 57K Hindus 263K Rose Bowl  Poppa's House  Bernardo 13K $TSLA 37K Brennan 12K Marmoush  Cam Ward  FogoChain 44K Susan Rice 13K Ronald 17K Tha Carter VI  Skyblivion  JUST ANNOUNCED 31K Mahomes 
Tue Apr 22 2025 18:42:28 GMT+0000 (Coordinated Universal Time)
Earth Day 150K $DYOR  #oppiwallet  Oblivion 99K Tim Pool  Skyrim 12K Kashmir 418K Ansu 16K Shannon 70K Bethesda 57K #Pahalgam 425K Al Gore  $CHERRY  CEXs  Lou Lamoriello  Alan Jackson  Expedition 33  jeno 267K Gulf of Mexico  Frenchy  #Sustainability  Gamepass 15K #tuesdayvibe  Nuttall  Bill Owens  Bond 52K Morrowind  #KarenReadTrial  Fort 54K Ronald 17K Will Wilson  YMCA  Tha Carter VI  FogoChain 44K JUST ANNOUNCED 29K Brennan 11K Nestle 67K Taco Tuesday 18K Cam Ward  Susan Rice 12K HIPAA  Punishing 13K Our Power 40K Downloading  Mahomes  Cyrodiil  Todd Howard  Mike Schmidt  Gilly  Brooks Robinson 
Tue Apr 22 2025 17:48:26 GMT+0000 (Coordinated Universal Time)
#EarthDay 93K $DYOR  Oblivion 90K Skyrim 11K Kashmir 339K Tim Pool  Shannon 67K Bethesda 56K Al Gore  CEXs  $CHERRY  #Pahalgam 326K Alan Jackson  Frenchy  jeno 257K Gamepass  Expedition 33  Gulf of Mexico  #tuesdayvibe  #Sustainability  Ronald 17K Tha Carter VI  Nuttall  #KarenReadTrial  Taco Tuesday 17K JUST ANNOUNCED 28K Morrowind  Our Planet 49K Todd Howard  Bond 52K Susan Rice 11K Nestle 64K YMCA  Cyrodiil  Downloading  Lally  Skyblivion  Mike Schmidt  Hank Brennan  Rosie O'Donnell  Ryan Poles  Fallout 3  Mahomes  Jason Drake  Kittle  The IMF 11K Brooks Robinson  PlayStation store  Rodney Rice  chaeyoung 41K
Tue Apr 22 2025 16:54:30 GMT+0000 (Coordinated Universal Time)
#EarthDay 87K $DYOR  Oblivion 81K $CHERRY  Skyrim 10K Kashmir 263K Bethesda 57K Al Gore  Alan Jackson  #tuesdayvibe  CEXs  jeno 238K Soon & Fogo  Game Pass  Frenchy  #Pahalgam 233K Expedition 33  #KarenRead  #Sustainability  Taco Tuesday 16K Todd Howard  Nestle 60K JUST ANNOUNCED 26K Ronald 17K Lally  Bond 51K FogoChain 44K Shannon 64K Hank Brennan  Our Power 39K Downloading  Cyrodiil  Larry David 20K Chaeyoung 37K $BTC 119K Skyblivion  Jack Nicholson  Bitcoin 371K Jason Drake  Rodney Rice  Damian Lillard  The IMF  PlayStation store  Fallout 3  Kittle  Ryan Poles  $TSLA 36K Clair Obscur  Thanos  Rosie O'Donnell 
Tue Apr 22 2025 16:00:28 GMT+0000 (Coordinated Universal Time)
#EarthDay 80K $SMS  Oblivion 65K $CHERRY  Alan Jackson  Skyrim  Kashmir 190K Soon & Fogo  #KarenRead  #tuesdayvibe  jeno 200K FogoChain 44K Bethesda 59K Game Pass 13K #Sustainability  Al Gore  Taco Tuesday 15K #IKnowWhatYouDidLastSummer  Hank Brennan  Lally  Todd Howard  Expedition 33  Our Planet 43K Frenchy  Nestle 56K Downloading  Bitcoin 367K Larry David 19K Good Tuesday 46K Michael Proctor  JUST ANNOUNCED 25K Chaeyoung 31K Rodney Rice  Jack Nicholson  Thanos  Damian Lillard  Absorbing Man  $TSLA 36K Dinger Tuesday  DEVON  The IMF  Susan Rice  Omar Khan  Ronald 17K Hunter or Carter  Fallout 3  DAME TIME  Rosie O’Donnell  yeonjun 100K Clair Obscur 
Tue Apr 22 2025 15:06:27 GMT+0000 (Coordinated Universal Time)
#EarthDay 73K $SMS  $CHERRY  #tuesdayvibe  FogoChain 42K Kashmir 126K #KarenRead  Hank Brennan  #IKnowWhatYouDidLastSummer  Taco Tuesday 14K Good Tuesday 43K Lally  Alan Jackson  #Sustainability  JUST ANNOUNCED 23K Our Planet 40K Larry David 18K Michael Proctor  Jack Nicholson  Nestle 51K Rodney Rice  Thanos  The IMF  Oblivion 39K Al Gore  yeonjun 91K Haley Stevens  jeno 115K $TSLA 35K Mary Moriarty 12K Mike Tomlin  Killmonger  jiho  John O'Keefe  CHARLOTTE X VS BOMBSHELL 507K Klaus 157K Loan 55K Magneto  Susan Rice  Mike Evans  Mahmoud 27K Terms 135K Nancy Mace 22K Dart  WILLIAMEST VIVO FRIENDS 662K Expedition 33  Drew Brees  Federally  Bethesda 44K Theory 59K
Tue Apr 22 2025 14:12:29 GMT+0000 (Coordinated Universal Time)
$SMS  #EarthDay 66K $CHERRY  #tuesdayvibe  FogoChain 41K Good Tuesday 40K Taco Tuesday 13K Kashmir 79K #IKnowWhatYouDidLastSummer  #Sustainability  #KarenRead  Larry David 16K Our Power 37K Jack Nicholson  Nestle 47K Thanos  Al Gore  yeonjun 81K Kawhi 83K $TSLA 34K Klaus 165K Mary Moriarty  CHARLOTTE X VS BOMBSHELL 462K Susan Rice  Theory 59K Hennepin County 18K Drew Brees  Emmitt Smith  Mike Evans  Mahmoud 26K Magneto  emily henry  Edward 41K First Lady 39K Shirley Temple  Maxine 36K Mace 26K Stockton  Cardinal Sarah 64K Seth Rich  Elway  Cocaine 12K Shakira 13K $TROLL 15K Mykel Williams  COLIN BLACKWELL  Pete Rose  Generator  McDavid  Secretary Hegseth 99K
Tue Apr 22 2025 13:18:27 GMT+0000 (Coordinated Universal Time)
Earth Day 70K Good Tuesday 36K #tuesdayvibe  #FOGO  #Massager  Kawhi 79K Larry David 14K #PutThatInYourPipe  Jack Nicholson  #22Abr  Nestle 43K Our Power 36K Thanos  Our Planet 34K Klaus 173K Al Gore  CHARLOTTE X VS BOMBSHELL 420K WILLIAMEST VIVO FRIENDS 593K $TSLA 34K Edward 43K Theory 60K Drew Brees  $TROLL 16K Oilers 15K Blackwell  First Lady 39K Cardinal Sarah 66K Maxine 37K McDavid  Cocaine 12K Mace 25K Shakira 13K Seth Rich  Generator  Pete Rose  Edmonton  Barry Sanders  Lloyd Austin  Barrett 22K #KarenRead  #Sustainability  #IKnowWhatYouDidLastSummer  #VictoriasSecretXCharlotte 433K #PatHeads  #vivoV50LitexWilliamEst 604K #Andor  #GOLD 33K
Tue Apr 22 2025 12:24:28 GMT+0000 (Coordinated Universal Time)
Earth Day 62K Good Tuesday 32K #FOGO  #tuesdayvibe  #Massager  Soon SVM 40K Kawhi 76K #PutThatInYourPipe  Happy Earth 19K #VictoriasSecretXCharlotte 382K Larry David 12K CHARLOTTE X VS BOMBSHELL 373K Jack Nicholson  Clippers 35K Jokic 26K Nestle 39K WILLIAMEST VIVO FRIENDS 544K Klaus 181K Oilers 15K Nuggets 34K $TROLL 16K Blackwell  Shakira 13K McDavid  Edward 44K $TSLA 34K Stars 117K Maxine 38K Theory 62K Skinner  Cocaine 12K Seth Rich  PLAYOFF HOCKEY  Braun 16K Ovechkin  Edmonton  Jamal 15K Barrett 21K Mace 24K #vivoV50LitexWilliamEst 551K #Wordle1403  #Sustainability  #gokingsgo  #TexasHockey  #Andor  #ClipperNation 
Tue Apr 22 2025 11:30:26 GMT+0000 (Coordinated Universal Time)
Earth Day 56K Good Tuesday 28K #FogoChain  #Massager  Kawhi 73K Soon SVM 40K #tuesdayvibe  #vivoV50LitexWilliamEst 478K Clippers 34K WILLIAMEST VIVO FRIENDS 476K Jokic 25K #VictoriasSecretXCharlotte 334K Larry David 10K Oilers 15K Brunson 40K Harden 20K Klaus 186K COLIN BLACKWELL  Nuggets 34K Jamal Murray  McDavid  NORMAN POWELL  Aaron Gordon  Stars 118K Shakira 13K Thibs  Theory 63K Skinner  Maxine 39K PLAYOFF HOCKEY  Edmonton  Braun 16K Edward 46K Ovechkin  Cocaine 13K Sami 36K Seth Rich  Barrett 21K Bridges 29K Bron Breakker 22K Clips 42K MacKinnon  #Wordle1403  #WWERaw 208K #GoKingsGo  #TexasHockey  #RawAfterMania 127K #StanleyCupPlayoffs  #ClipperNation 
Tue Apr 22 2025 10:36:27 GMT+0000 (Coordinated Universal Time)
Kawhi 71K #FogoChain  Earth Day 52K #Massager  Good Tuesday 24K #vivoV50LitexWilliamEst 392K Jokic 25K Clippers 33K WILLIAMEST VIVO FRIENDS 391K #Wordle1403  Oilers 15K Brunson 39K McDavid  #WWERaw 205K Harden 19K Klaus 190K NINESTAR YOU ARE OUT 67K Kanye 75K Nuggets 33K COLIN BLACKWELL  Larry David  Murray 47K Skinner  Braun 16K Norman Powell  Aaron Gordon  Denver 22K Stars 119K Thibs  Ryan Anderson  Edmonton  Ovechkin  Shakira 13K Edward 47K Sami 36K The Knicks 29K Maxine 38K Bridges 30K Bron Breakker 21K Clips 42K MacKinnon  Batum  Pat McAfee 23K Hunter Brown  Rusev Day  #GoKingsGo  #TexasHockey  #RawAfterMania 125K #ClipperNation  #RawOnNetflix 19K
Tue Apr 22 2025 09:42:25 GMT+0000 (Coordinated Universal Time)
Kawhi 69K Jokic 25K #FogoChain  Clippers 33K Soon Blockchain  #vivoV50LitexWilliamEst 270K WILLIAMEST VIVO FRIENDS 270K Oilers 15K #Massager  Earth Day 50K Pistons 44K #TexasHockey  Brunson 39K Knicks 48K McDavid  #WWERaw 202K Nuggets 33K COLIN BLACKWELL  Harden 19K Aaron Gordon  NINESTAR YOU ARE OUT 62K Kanye 73K Murray 47K Edmonton  Stars 121K Klaus 193K Skinner  Braun 15K Denver 22K Thibs  Rusev 30K Ryan Anderson  Larry David  Sami 36K Ovechkin  Bouchard  Dunn  Seth and Bron  Marchment  Dangerous Alliance  Shakira 13K Theory 64K Mikal  Zubac  Bron Breakker 21K Detroit 31K Norm Powell  Maxine 38K Giulia 15K Mackinnon 

Trending Topic Statistics and Insights
Longest Trending
Earth Day for 14 hrs
Oblivion for 13 hrs
Al Gore for 13 hrs
$TSLA for 11 hrs
Kashmir for 11 hrs
Trends with Maximum Tweets
Kashmir with 4M tweet
WILLIAMEST VIVO FRIENDS with 2.9M tweet
#vivoV50LitexWilliamEst with 2.3M tweet
Earth Day with 2.1M tweet
#Pahalgam with 2M tweet
New Trends
Kaprizov at #22
Hague at #30
Theodore at #32
Albedo at #44
Max Domi at #47
Popular Active Trends
Oblivion
Earth Day
Tim Pool
Dame
Reaves

trends24.in - tracking X (formerly twitter) Trending Topics for over a decade.
Keep track of global X trending topics and hashtags for the past 24 hours. Archive website (coming soon) will let you check historical trends. Want more of Twitter trends? Subscribe to us on Gumroad and checkout all the products and services (coming soon).  Reach out to us on the contact page if you need something more.
Email address

Subscribe
We care about privacy. Your details will not be shared with any third party.