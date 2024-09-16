PennController.ResetPrefix(null); // Initiates PennController
DebugOff(),  // For finalized version
/*
NOTES FOR LIN FROM MAX ABOUT REPURPOSING FOR NEW PARTICIPANTS OUTSIDE OF ORIGINAL STUDIES
-Update LargeText.csv to include correct email addresses and terms
-Change consent depending on if study links to qualtrics and is two part.
-Question about college needs to be changed or removed
    -remove from Sequence also
-Search for "XXXX" in comments for places to change based on language
*/


// Max: These two functions were written by Jeremy (PCIbex creator), I have limited understanding of their functionality.

/**
 *  Concatenates the sentence to show only the word at the indexed entered. Everything else is hidden with only the
 *  underline revealed
 * 
 * @param array_of_word - The sentence that the subject is currently seeing.
 * @param show_index - The index we want to show the word at
 * 
 */
showWord = (array_of_word,show_index) => "<p>" + // swap "<p>" with "<p style='font-family: monospace;'>" to allow the masked font to change

    // The body of the function follows after the arrow


    array_of_word.map( (word,current_index) => {
    //.map() iterates over the array for each word and current index n and creates and populates a new array with the output
    // of the function when called over every item of the array

    const letters = word;  //j this only keeps letters (and numbers) // type auto deduction property of JS
    if (current_index==show_index) return "<span>"+letters+"</span>";
    // if current index is equal to show_index we return the letter in a span container

    else return "<span style=\'border-bottom:solid 1px black;\'><span style='visibility: hidden;'>"+letters+"</span></span>";
    // otherwise we return a span container that has a bottom border revealed but the words themselves hidden
    // This accounts for the masked words

  } ).join(" ") + "</p>"; // the " " dictates what character is used to separate each word, can use &nbsp instead to allow multiple spaces

/**
 * Controls word revealing. Reveals the next word when the subject presses space.
 * 
 * @param name - Name of the current trial
 * @param sentence - The sentence that is passed in
 * 
 */

dashed = (name, sentence) => {

    const words = sentence.split(" ");  //j Use space to break string into array

    return [  //j Return an array of key.wait + text.print commands
        [ newText(name,showWord(words)).print() ], //j First reveal no word

        // No index is passed, so no word will be revealed

        ...words.map( (word,index) => [
            newKey(name+"-"+index+"-"+word," ").log().wait(), 
            
            //New key is created; triggered by space; identified by name+"-"+index+"-"+word


            getText(name).text(showWord(words,index)) //j reveal INDEXth word
            

            // Massive inefficiency? For each word a new array of size array.length() is created? Overall O(n^2) algorithm??
            // Works fine if sentence is short

        ]),
        [ newKey(name+"-last"," ").log().wait() ]
    ].flat(1);
}

/**
 * Controls word revealing. Reveals the next word when the subject presses space. 
 * Does not log the presses.
 * 
 * @param name - Name of the current trial
 * @param sentence - The sentence that is passed in
 * 
 */

dashed_nolog = (name, sentence) => {  // same as above except it doesn't log each key press, used for the practice trials as we don't need that data.
    const words = sentence.split(" ");  
    return [  
        [ newText(name,showWord(words)).print() ], 
        ...words.map( (word,index) => [
            newKey(name+"-"+index+"-"+word," ").wait(), 
            getText(name).text( showWord(words,index) ) 
        ]),
        [ newKey(name+"-last"," ").wait() ]
    ].flat(1);
}



/**
 * Inserts seperator elements for each n main elements added. Mainly used to insert breaks at
 * set intervals.
 * 
 * @param main - Array of elements. Elements can be each self paced reading trials.
 * @param sep - Array of elements. Elements can be "breaks" in between each new sentence.
 * @param n - The number of new sentence that the subject has to go through before receiving break.
 */

function SepWithN(sep, main, n) {
    
    this.args = [sep,main];

    //Automatically called when a new instance is created;
    this.run = function(arrays) {
        assert(arrays.length == 2, "Wrong number of arguments (or bad argument) to SepWithN");
        assert(parseInt(n) > 0, "N must be a positive number");
        let sep = arrays[0];
        let main = arrays[1];
        if (main.length <= 1)
            return main
        else {
            let newArray = [];
            while (main.length){
                for (let i = 0; i < n && main.length>0; i++)
                    newArray.push(main.pop());
                for (let j = 0; j < sep.length && main.length>0; ++j)
                    newArray.push(sep[j]);
            }
            return newArray;
        }
    }
}



function sepWithN(sep, main, n) { return new SepWithN(sep, main, n); } 
//Wrapper function to call main functions

Sequence("Consent", "LangCheck", "CollCheck", "HardwareQ", "Attention", "Calibration", "Instructions",
"PracIntro", "PracTrial", "ExpIntro", sepWithN("break", randomize("ExpTrial"),16), SendResults(), "EndExp")  

//Break
newTrial("break",
    newTimer("buffer",500).start().wait(),
    newText("BreakText1","Please take a break.<br><br>").center().print(),
    newText("BreakText2","After 30 seconds a button to continue will appear but you may take more time if you need.<br><br>").center().print(),
    newTimer("BreakTimer",30000).start().wait(),
    newButton("BreakEnd","Click to end the break").center().print().wait().remove()
)

/**
 * Template for the consent form
 * 
 * Changes made to original version:
 * Moved the text of the consent form to "ConsentForm.csv"
 * 
 * TODO: It is possible to switch out the "language" given any language. That is, we don't have to have multiple files differing only on language.
 * TODO: Ask if the number in the text is still her phone number
 */

Template(GetTable("consent_form.csv"), row=> newTrial("Consent",
    newText("Thank you for signing up for our study!").center().css("font-size","30px").print(),
    newText(row.consent_chinese).css("margin-top","20px").print(),
    newButton("I consent to participate in this study").center().print().wait().remove()
))




/**
 * Template for the language check
 * 
 * Changes made to original version:
 * Moved the text of the consent form to "language_checks.csv"
 * Refactored the "if statement" to be "if else" instead of enumerating the cases
 * 
 * 
 * 
 */
Template(GetTable("language_checks.csv"), row=> newTrial("LangCheck",
    newText(row.language_select).print(),
    newText("LangChk", row.language_fail).center(),
    newButton("Continue").center(),
        newDropDown("LangSelect","Native language").print()
        .add("English","Chinese","Korean","Spanish","Other")
        .css("margin-left","20px").css("margin-top","10px").css("margin-bottom","20px")
        .callback(getDropDown("LangSelect").log("All")   //Participant can change choice, but each selection gets logged

            .test.selected("Chinese")
            .success(getButton("Continue").print(),getText("LangChk").remove())
            .failure(getButton("Continue").remove(),getText("LangChk").print())

        ),
    getButton("Continue").wait()
))

/**
 * Template for college questionnaire
 * 
 * Changes made to original version:
 * No changes are made to code. Only changes made are text based.
 * 
 * 
 * TODO: Some parts of seems to be redundant
 * TODO: Change college list
 * 
 */

Template(GetTable("college_checks.csv"), row=> newTrial("CollCheck",
    newTimer("buffer",150),
    newButton("ContinueYes","Continue"),
    newButton("ContinueNo","Continue")
        .callback(
            clear(),
            getTimer("buffer").start().wait(),
            newText(row.not_college_student).print()
        ),
    newDropDown("DD1Drop","Please select a response") //Has to be created first, otherwise it logs after the others
        .add("Yes","No").css("margin-left","20px").css("margin-top","10px").css("margin-bottom","40px"),
    newDropDown("DD2Drop","Please select a response").add(
        "0 Years, am begining my first year (freshman) in Fall 2024",
        "1 Year, am begining my second year (sophomore) in Fall 2024",
        "2 Years, am begining my third year (junior) in Fall 2024",
        "3 Years, am begining my fourth year (senior) in Fall 2024",
        "4 or more years, I am begining another semester in Fall 2024",
        "I am a graduate student and I am begining another semester in Fall 2024")
        .callback( 
            getTimer("buffer").start().wait()
        ),
    newText("DD1Text","Are you currently a college student?").print(),
    newDropDown("DD3Drop", "Please select a response").add(
        "University of Pittsburgh","Community College of Allegheny County","Carnegie Mellon University",
        "Duquesne University","Point Park University","Chatham University","Carlow University",        
        "UPMC Shadyside School of Nursing","Pittsburgh Theological Seminary","West Penn Hospital School of Nursing",        
        "Kaplan Career Institute","Other/Not Listed","Prefer not to answer")
        .callback( 
            getTimer("buffer").start().wait(),
            getButton("ContinueYes").center().print()
        ),
    getDropDown("DD1Drop")
        .callback( self.test.selected("Yes").log("All")
            .success(
                getButton("ContinueNo").remove(),
                getTimer("buffer").start().wait(),
                newText("DD2Text","How many years of college have you completed so far?").print(),
                getDropDown("DD2Drop").css("margin-left","20px").css("margin-top","10px").css("margin-bottom","40px").print().wait().log("All"),
                getTimer("buffer").start().wait(),
                newText("DD3Text","Which college/university are you attending?").print(),
                getDropDown("DD3Drop").css("margin-left","20px").css("margin-top","10px").css("margin-bottom","40px").print().log()
            )
            .failure(
                getButton("ContinueYes").remove(),
                getText("DD2Text").remove(),
                getDropDown("DD2Drop").remove(),
                getText("DD3Text").remove(),
                getDropDown("DD3Drop").remove(),
                getTimer("buffer").start().wait(),
                getButton("ContinueNo").center().print()
            )
        ).print().wait(),
    getButton("ContinueYes").wait()
))

//Hardware Question
Template("LargeText.csv", row=> newTrial("HardwareQ" ,
    newTimer("buffer",150),
    newText(row.DvcTxt).print(),
    newDropDown("DeviceType","What device are you using for this experiment").css("margin-left","20px")
        .add("Desktop Computer","Laptop Computer").print().wait()
        .test.selected().success(getTimer("buffer").start().wait()).log(),
    newText(row.BrwsTxt).css("margin-top","20px").print(),
    newDropDown("BrowserType","What Web-Browser are you using for this experiment").css("margin-left","20px")
        .add("Google Chrome","Firefox","Safari","Internet Explorer","Microsoft Edge","Opera","Other").print().wait()
        .test.selected().success(getTimer("buffer").start().wait()).log(),
    newButton("Continue").css("margin-top","25px").center().print().wait()
))
//Attention
Template("LargeText.csv", row=> newTrial("Attention",
    newImage("mark1","checkmark.png"),newImage("mark2","checkmark.png"),newImage("mark3","checkmark.png"),newImage("mark4","checkmark.png"),newImage("mark5","checkmark.png"),
    newButton("check1","1. I have silenced my cell phone.").css("padding","5px"),
    newButton("check2","2. I have closed all other tabs from my browser.").css("padding","5px"),
    newButton("check3","3. I am not listening to any music or any other audio.").css("padding","5px"),
    newButton("check4","4. I am not using any chatting software or programs.").css("padding","5px"),
    newButton("check5","5. I am in a quiet, undisturbed environment.").css("padding","5px"),
    newButton("agree","I am ready to begin the experiment"),
    newCanvas("checks",600,275)
        .add(15,0,getButton("check1")).add(15,55,getButton("check2")).add(15,110,getButton("check3")).add(15,165,getButton("check4")).add(15,220,getButton("check5")),

    newText(row.AttnTxt).print(),
    newTimer(3000).start().wait(),
    getCanvas("checks").print(),getButton("check1").disable(),getButton("check2").disable(),getButton("check3").disable(),getButton("check4").disable(),getButton("check5").disable(),
    getButton("agree").center().print().disable(),
    getButton("check1").enable().once().wait().after(getImage("mark1")),
    getButton("check2").enable().once().wait().after(getImage("mark2")),
    getButton("check3").enable().once().wait().after(getImage("mark3")),
    getButton("check4").enable().once().wait().after(getImage("mark4")),
    getButton("check5").enable().once().wait().after(getImage("mark5")),
    getButton("agree").enable().wait()
))
//Calibration
Template("LargeText.csv", row=> newTrial("Calibration",
    newText(row.AdjHead).css("margin-bottom","15px").css("font-size","30px").center().print(),
    newCanvas("CalibrateBox",1000,100).center().css("border","solid 2px black")
        .add("center at 50%","center at 50%",newText("InBox",row.InBox).css("text-align","center")).print(),
    newText(row.AdjTxt).css("line-height","30px").css("margin-top","25px").css("margin-left","50px").print(),
    newButton("I verify the box above fits on screen<br> and the text inside is readable.").center().print().wait()
))
//Instructions
Template("LargeText.csv", row=> newTrial("Instructions",
    newText("<b>Experiment Instructions</b><br>").center().css("font-size","30px").print(),
    newText(row.InstTxt).css("line-height","30px").print(),
    newButton("Continue").center().print().wait().remove()
))
//Practice Intro
Template("LargeText.csv", row=> newTrial("PracIntro",
    newText(row.PracInt).center().print(),
    newButton("Click here to begin the practice trials").center().print().wait()
))
// Practice trial code; copied from the main experiment with minor changes; may be possible to use same code for both
Template("L2Practice.csv",row => newTrial("PracTrial",
    newButton("GotoNextTrial","Click to start a trial"),
    newButton("GotoCompQ","Proceed to Comprehension Question"),
    newText("spacer","<br>"),
    newVar("CompQResp","N/A").global(),
    newVar("CorResp",row.CorResp),
    newVar("Feedback","N/A").global(),
    newText("CompQ",row.CompQ),
    newButton("TrueResp","TRUE")
        .callback(getVar("CompQResp").set("TRUE")),
    newButton("FalseResp","FALSE")
        .callback(getVar("CompQResp").set("FALSE")),    
    newTimer("feedbacktimer",1000),
    newTimer("warnTimer",30000),
    newTimer("CompQTimer",10000),
    newText("warnText","Please complete the trial before taking a break."),
    newText("CompQwarn","<br><br>Please answer the question before taking a break."),
    newText("InstructReminder","Reminder: you must press spacebar to advance through the trial").center(),
    
    getText("spacer").center().css("padding-top","15px").print(),
    getText("InstructReminder").print(),
    
    getButton("GotoNextTrial").center().css("margin-top","30px").print().wait().remove(), 
    getText("spacer").remove(),
    getText("InstructReminder").remove(),
    
    getVar("CompQResp").set("N/A"),getVar("Feedback").set("N/A"),
    getTimer("warnTimer").start()
        .callback(getText("warnText").center().bold().css("font-size","30px").print()),  
    ...dashed_nolog("FullText", row.FullText),
    getText("FullText").remove(), 
    getTimer("warnTimer")
        .test.ended()
        .failure(getTimer("warnTimer").stop()),
    getText("warnText").remove(),
    (row.CompYN=="Y" ?
    [   getText("spacer").css("padding-top","15px").print(),
        getButton("GotoCompQ").center().css("margin-top","30px").print().wait().remove(),
        getText("spacer").remove(),
        getText("CompQ").center().print().log(),
        getTimer("CompQTimer").start()
            .callback(getText("CompQwarn").center().bold().css("font-size","30px").print()),  
        newCanvas("TFButtons",250,0) 
            .add(0,0,getButton("TrueResp")).add(180,0,getButton("FalseResp"))
            
            .center().print(),
        newSelector("TFResp")
            .add(getButton("TrueResp"),getButton("FalseResp"))
            .wait().remove().log(),
        getText("CompQ").remove(),
        getTimer("CompQTimer")
            .test.ended()
            .failure(getTimer("CompQTimer").stop()),
        getText("CompQwarn").remove(),
        getCanvas("TFButtons").remove(),
        getVar("CompQResp")  
            .test.is(getVar("CorResp"))
                .failure(getVar("Feedback").set("Wrong!"))  
                .success(getVar("Feedback").set("Correct!")),
        getText("spacer").print(),
        newText("Accuracy").center().css("font-size","30px")
            .text(getVar("Feedback")).print(),
        getTimer("feedbacktimer").start().wait(),
        getText("spacer").remove(),getText("Accuracy").remove(),
    ]:[])) // Nothing needs to go here, if there isn't a CompQ, just loop next trial
.log("ItemNum",row.ItemNum)  // these log calls must be identical to those used in the experiment, otherwise formatting problems occur with results
.log("WC",row.WordCount)
.log("CompYN",row.CompYN)
.log("CompQResp",getVar("CompQResp"))
.log("CorResp",row.CorResp)
.log("Feedback",getVar("Feedback"))
.log("WarnCount",getVar("warncount"))
.log("ParticipantID",GetURLParameter("id") )
.log("TrialNum","None")
) 
//Experiment Intro
Template("LargeText.csv", row=> newTrial("ExpIntro",
    newText(row.ExpInt).center().print(),
    newButton("Click here to begin the main experiment.").center().print().wait()
))
Template("L2Full.csv",row => newTrial("ExpTrial",
    newButton("GotoNextTrial","Click to start a trial"),
    newButton("GotoCompQ","Proceed to Comprehension Question"),
    newText("spacer","<br>"),
    newVar("TrialNum",0).global(),
    newVar("warncount",0).global(),
    newVar("CompQResp","N/A").global(),   // making these global allows them to be logged as their own columns, 
    newVar("CorResp",row.CorResp),
    newVar("Feedback","N/A").global(),
    newText("CompQ",row.CompQ),
    newButton("TrueResp","TRUE")
        .callback(getVar("CompQResp").set("TRUE")),
    newButton("FalseResp","FALSE")
        .callback(getVar("CompQResp").set("FALSE")),    
    newTimer("feedbacktimer",1000),
    newTimer("warnTimer",30000),
    newText("warnText","Please complete the trial before taking a break."),
    newTimer("CompQTimer",10000),
    newText("CompQwarn","<br><br>Please answer the question before taking a break."),

    getText("spacer").center().css("padding-top","15px").print(),
    getButton("GotoNextTrial").center().css("margin-top","30px").print().wait().remove(), 
    getText("spacer").remove(),
    getVar("CompQResp").set("N/A"),getVar("Feedback").set("N/A"),  // makes sure the variables get reset to N/A before each trial, makes results less confusing.
    getTimer("warnTimer").start()  // timer that runs during the main task, if it reaches 0 it will display "warnText"
        .callback(getText("warnText").center().bold().css("font-size","30px").print()),
    ...dashed("FullText", row.FullText),
    getVar("TrialNum").set(v=>v+1),
    getText("FullText").remove(), 
    getTimer("warnTimer")
        .test.ended()
        .failure(getTimer("warnTimer").stop()) // if the timer is still running when the trial ends, this stops it, which displays the warning
        .success(getVar("warncount").set(v=>v+1)),  // if the timer ended and the warning was was displayed, increment variable "warncount" by 1
        
    getText("warnText").remove(),  // this removes the warning, applies to both cases as stopping the timer also causes the warning to appear
    (row.CompYN=="Y" ?  // functions like an if statement based on the specified test, if row.CompYN==Y, then the following code is executed, if not, run code after the colon
    [ // brackets needed to include multiple commands as part of the 'success' branch of the above test  
        getText("spacer").css("padding-top","15px").print(),
        getButton("GotoCompQ").center().css("margin-top","30px").print().wait().remove(),
        getText("spacer").remove(),
        getText("CompQ").center().print()
            .log(),  // This creates a row in the results that has the time at which the comprehension question appeared
        getTimer("CompQTimer").start()  // This is a 20 second timer that triggers a text warning if they spend more than 20 seconds to click True or False on the comprehension question.
            .callback(getText("CompQwarn").center().bold().css("font-size","30px").print()), 
        newCanvas("TFButtons",250,0) 
            .add(0,0,getButton("TrueResp")).add(180,0,getButton("FalseResp"))
            .center().print(),
        newSelector("TFResp")
            .add(getButton("TrueResp"),getButton("FalseResp")).wait().remove()
            .log(),  // This creates a row in the results that has the time at which the comprehension question was answered, can be compared to "CompQ" to see how long they spent on the question
        getText("CompQ").remove(),
        getTimer("CompQTimer")
            .test.ended()
            .failure(getTimer("CompQTimer").stop()),
        getText("CompQwarn").remove(),
        getCanvas("TFButtons").remove(),
    // Simple Feedback
        getVar("CompQResp")  
            .test.is(getVar("CorResp"))  //This line compares the user's response with the correct response according to the .csv file
                .failure(getVar("Feedback").set("Wrong!"))  
                .success(getVar("Feedback").set("Correct!")),
        getText("spacer").print(),
        newText("Accuracy").center().css("font-size","30px")
            .text(getVar("Feedback")).print(),
        getTimer("feedbacktimer").start().wait(),
        getText("spacer").remove(),getText("Accuracy").remove(),
    ]:[  // close first bracket, colon marks the change to the 'failure' branch of the test, open new bracket for the 'failure' branch
         // Nothing needs to go here, if there isn't a CompQ, just loop next trial
    ]  ) // closes the bracket and then the 'test'
) // closes the trial
// ANY .LOGS HERE MUST MATCH THE LOGS IN THE PRACTICE, ELSE PROBLEMS
.log("ItemNum",row.ItemNum)
.log("WC",row.WordCount)
.log("CompYN",row.CompYN)
.log("CompQResp",getVar("CompQResp"))
.log("CorResp",row.CorResp)
.log("Feedback",getVar("Feedback"))
.log("WarnCount",getVar("warncount"))
.log("ParticipantID",GetURLParameter("id") )
.log("TrialNum",getVar("TrialNum"))
)  // closes the Template
//End Screen
Template("LargeText.csv", row=> newTrial("EndExp",
    newText(row.End).print(),
    newButton("void").wait()
).setOption("hideProgressBar","true"))