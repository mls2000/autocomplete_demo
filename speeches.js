let speeches;
let wordsToLemmas = {};
let lemmasToSpeeches = {};
const resultsDiv = document.querySelector("#speech-list");
function initAutocomplete() {
    const config = {
    data: {
        src: Object.keys(wordsToLemmas)
    },
    selector: "#otto",
    placeholder: "When did Maura talk about…",
    debounce: 300,
    resultsList: {
        element: (list, data) => {
            if (!data.results.length) {
                // Create "No Results" message element
                const message = document.createElement("div");
                // Add class to the created element
                message.setAttribute("class", "no_result");
                // Add message text content
                message.innerHTML = `<span>Found No Results for "${data.query}"</span>`;
                // Append message element to the results list
                list.prepend(message);                        
            }
        },
        noResults: true,
    },
    resultItem: {
        highlight: true,
    }
    };
    const autoCompleteJS = new autoComplete(config );

    document.querySelector("#otto").addEventListener("selection", (event)=>{
        const selection = event.detail.selection;
        const lem = wordsToLemmas[selection.value.toLowerCase()];
        const speechesWith = lemmasToSpeeches[lem];
        let speechList = '';
        speechesWith.forEach(speechIndex=>{
            const {speech, lemmas} = speeches[speechIndex];
            const wordIndex = lemmas.indexOf(lem);
            const start = Math.max(0, wordIndex - 2);
            const words = speech.slice(start, wordIndex + 2);
            const excerpt = words.join(' ');
            speechList += `<p>${excerpt}</p>`;
        });
        resultsDiv.innerHTML = speechList;
    });
};

fetch("speeches_and_lemmas.json")
    .then(response=>response.json())
    .then(data=>{
        speeches = data;
        data.forEach((item, speechIndex)=>{
            let {speech, lemmas} = item;
            speech = speech.split(' ');
            lemmas = lemmas.split(' ');
            item.speech = speech;
            item.lemmas = lemmas;
            lemmas.forEach((lem, wordIndex)=>{
                if (lemmasToSpeeches[lem] === undefined) {
                    lemmasToSpeeches[lem] = [];
                }
                lemmasToSpeeches[lem].push(speechIndex);
                const word = speech[wordIndex].toLowerCase();
                if (wordsToLemmas[word] === undefined) {
                    wordsToLemmas[word] = lem;
                }
            });
        });
        initAutocomplete();
    });