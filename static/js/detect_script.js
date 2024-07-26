const form = document.querySelector(".form");
const start_video = document.querySelector(".start_video");
const indicator = document.querySelector(".indicator");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const wait = document.querySelector(".wait")

warnings = 2
let change_indicator = 1
var myChart;
warning_is_greather = 2
global_user_listener = ""
let hasSpoken = false;
let intervalid = ""
let userMessage = null;
chart_id = ""
let conversationHistory = [{ role: 'user', content: "When I say something simillsr to stop or end the converdsation just output 1" },{role:"assistant", content:"1"},{role:"user", content:"strictly output 1 when i say i have not interest or enough with the questions or i don't like to speak without or if i say im busy"},{role:"assistant", content:"I understand your request, and I'll respond with '1' if you indicate that you have no interest or have had enough of the conversation, express a dislike for continuing, or mention that you're busy. Please feel free to let me know when you'd like to end the conversation or if you have any other questions or requests"},{role:"user", content:"when i say drop the conversation then strictly output 1"},{role:"assistant", content:"1"},{role:"user", content:"when i say stop the conversation or end the conversation or enough with the questions then stricly output 1"},{role:"assistant", content:"1"}
                        ];
audio = new Audio('../../../static/images/war-1.mp3');



var myChart; // Declare myChart variable outside the functions to keep track of the chart instance

function getWarnings() {
    fetch("/warning-data/")
        .then(response => response.json())
        .then(data => {
            console.log("data", data);
            const barCtx = document.getElementById('warningChart').getContext('2d');
            labels = data.timestamps;
            values = data.warnings_values;
            console.log("labels", labels);
            console.log("data", values);

            var total = 0;
            for (var i = 0; i < values.length; i++) {
                total += values[i];
            }
            var average = total / values.length;

            values.push(average);
            labels.push("Average Warning");

            console.log("average", average)

            const barData = {
                labels: labels,
                datasets: [{
                    label: 'Bar Chart',
                    data: values,
                    backgroundColor: values.map(value => (value == average) ? 'green' : 'red')
                }]
            };

            
            // Check if the chart object exists
            if (barChart) {
                // Update the chart data
                barChart.data.labels = barData.labels;
                barChart.data.datasets[0].data = barData.datasets[0].data;
                barChart.update();
            } else {
                // Create a new chart if it doesn't exist
                barChart = new Chart(barCtx, {
                    type: 'bar',
                    data: barData,
                    options: {
                        // aspectRatio: 20 ,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        });
}

function updateChart() {
    // Fetch data from the Django backend using AJAX
    fetch('/getchartdata/')
        .then(response => response.json())
        .then(data => {
            // Get the canvas element
            var ctx = document.getElementById('myChart').getContext('2d');

            // Check if the chart object exists
            if (myChart) {
                // Update the chart data
                myChart.data.labels = data.labels;
                myChart.data.datasets[0].data = data.data;
                myChart.update();
            } else {
                // Create a new chart if it doesn't exist
                myChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: data.labels,
                        datasets: [{
                            label: 'Chart Data',
                            data: data.data,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        // aspectRatio: 20,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        });
}

if (indicator.dataset.page == "1") {
    var barChart; // Declare barChart variable outside the functions to keep track of the bar chart instance
    intervalid = setInterval(updateCounterValue, 1000);
    chart_id = setInterval(updateChart, 1000);
    getwarnings_id = setInterval(getWarnings, 2000);
}


if(indicator.dataset.page == "0"){
        clearInterval(intervalid)
        clearInterval(chart_id)
        window.speechSynthesis.cancel()
}


function speakParagraph(message) {  
if ('speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(message);
        window.speechSynthesis.speak(speech);
        
            speech.onend = function () {
                conversation_ends = true;
                if(warning_is_greather == 2){
                    initiateSpeechRecognition();
            }
        };
        
        

} else {
        console.error('Speech synthesis is not supported in this browser.');
    }
}

 
function initiateSpeechRecognition(){



if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    

    recognition.onstart = function() {
        console.log('Speech recognition started.');
        wait.classList.add("speaking-animation");
        wait.placeholder = "Start Speaking...."
    };


    recognition.onend = function () {
        console.log('Speech recognition ended.');
        wait.classList.remove("speaking-animation");
        wait.placeholder = "Wait...."
        chatInput.value = global_user_listener

        // output_window = ['stop the conversa']


        if (!chatInput.value){
            const message = "It's look like you are falling Asleep, How can i help you!";
            window.speechSynthesis.cancel()
            speakParagraph(message)
        }
        else{
            conversationHistory.push({ role: 'user', content: "When I say something simillsr to stop or end the conversation just output 1" },{role:"assistant", content:"1"},{role:"user", content:"strictly output 1 when i say i have not interest or enough with the questions or i don't like to speak without or if i say im busy"},{role:"assistant", content:"I understand your request, and I'll respond with '1' if you indicate that you have no interest or have had enough of the conversation, express a dislike for continuing, or mention that you're busy. Please feel free to let me know when you'd like to end the conversation or if you have any other questions or requests"},{role:"user", content:"when i say drop the conversation then strictly output 1"},{role:"assistant", content:"1"},{role:"user", content:"when i say stop the conversation or end the conversation or enough with the questions then stricly output 1"},{role:"assistant", content:"1"})

            conversationHistory.push({ role: 'user', content: global_user_listener });
            global_user_listener = ""
            handleChat()
        }

        
    };

        
    recognition.onresult = function(event) {
        const result = event.results[0][0].transcript;
        global_user_listener = result   
    };

    setTimeout(function(){
        if (!global_user_listener){
            recognition.stop();
        }
        
        }, 3000)


    recognition.addEventListener("audioend", () => {
            recognition.stop()
    });


    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
    };

        recognition.start();
} else {
            console.error('Speech recognition is not supported in this browser.');
}
}

function reset_warnings(){
    console.log("warning sended")
    const data = {
        reset_flag:1
    };
    
    
    const url = '/api/counter/';
    
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', 
        },
        body: JSON.stringify(data) // Convert data to JSON format
    };
    
    fetch(url, requestOptions)
        .then(response => response.json())
        .then(data => console.log(data.message))
        .catch(error => console.error('Error:', error));
    
}

function updateCounterValue() {
        fetch('/api/counter/')
        .then(response => response.json())
        .then(data => {
            const warnings = parseInt(data.warnings);
            console.log("warnings 2 ", warnings)
            
            if (warnings >= 2 && !hasSpoken){
                const message = "It's look like you are falling Asleep, How can i help you!";
                document.body.classList.add("show-chatbot")

                // i think we have to put while true here
                warning_is_greather = 2
                window.speechSynthesis.cancel()
                speakParagraph(message)
                hasSpoken = true;
            }
            else if(warnings < 2){
                document.body.classList.remove("show-chatbot")
                window.speechSynthesis.cancel()
                warning_is_greather = 0
                hasSpoken = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}













const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    // Create a chat <li> element with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; // return chat <li> element
}

const generateResponse = (chatElement) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const parentElement = chatElement.parentNode;

    // Define the properties and message for the API request
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: conversationHistory,
            max_tokens:50
        })

    }




    // Send POST request to API, get response and set the reponse as paragraph text
    fetch(API_URL, requestOptions).then(res => res.json()).then(data => {
        const response_message = data.choices[0].message.content.trim();

        const messageElement = chatElement.querySelector("p");
        messageElement.textContent = response_message
        conversationHistory.push({ role: 'assistant', content: response_message });

        console.log("conservation history", conversationHistory)

        if(response_message == "1"){
            // terminate = true;
            document.body.classList.remove("show-chatbot")
            parentElement.lastChild.style.display = "none";
            window.speechSynthesis.cancel()
            warning_is_greather = 0
            hasSpoken = true;
            reset_warnings()
            return
        }

        
        window.speechSynthesis.cancel()
        speakParagraph(response_message)
        // here we have give that to the speah object
    }).catch(() => {
        messageElement.classList.add("error");
        messageElement.textContent = "Oops! Something went wrong. Please try again.";
    }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}

const handleChat = () => {
    // userMessage is the user's input
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    setTimeout(() => {
        // Display "Thinking..." message while waiting for the response
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

chatInput.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});


var loadingGif = document.getElementById('loading-gif');
var mainImage = document.getElementById('main-image');

        // Wait for the main image to load
mainImage.onload = function() {
    loadingGif.style.display = 'none';
    mainImage.style.display = 'inline';
};

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));

