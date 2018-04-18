let prepareJson = {};

const today = new Date();
const dd = today.getDate();
const mm = today.getMonth() + 1; //January is 0!
const yyyy = today.getFullYear();
const today_str = mm + '/' + dd + '/' + yyyy;

window.onload = () => {
    document.getElementById('first_year').value = yyyy - 1;
    document.getElementById('this_year').value = yyyy;
    let inputs = document.getElementsByTagName('input');
    for (let i = 0; i < inputs.length; i++) {
        let input = inputs[i];
        input.addEventListener('focus', toggleClass);
        input.addEventListener('blur', toggleClass);
        input.addEventListener("change", check_input);
    }
    check_all_input()
};

function toggleClass() {
    let obj = this.previousElementSibling;
    while (obj.tagName !== "LABEL") {
        obj = obj.previousElementSibling;
    }
    obj.classList.toggle('focus');
    check_all_input()
}

function check_all_input() {
    let all_inputs = document.getElementsByTagName('input');
    for (let i = 0; i < all_inputs.length; i++) {
        let input = all_inputs[i];
        if(input.type ==="text"){
            let inputs = input.parentElement.getElementsByTagName('input');
            let error = input.parentElement.previousElementSibling.getElementsByClassName("count")[0];
            error.innerHTML = 0;
            for (let i = 0; i < inputs.length; i++) {
                let input = inputs[i];
                if (input.value === "" && input.style.display !== "none") {
                    error.innerHTML++
                }
            }
        }
    }
}

function check_input() {
    let inputs = this.parentElement.getElementsByTagName('input');
    let error = this.parentElement.previousElementSibling.getElementsByClassName("count")[0];
    error.innerHTML = 0;
    for (let i = 0; i < inputs.length; i++) {
        let input = inputs[i];
        if (input.value === "" && input.style.display !== "none") {
            error.innerHTML++
        }
    }
}


function saveAsJson() {
    getData();
    let blob = new Blob([JSON.stringify(prepareJson)], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "data.json");
}

function generateFile() {
    getData();
    loadFile("template_document.docx", function (error, content) {
        if (error) {
            throw error
        }
        let zip = new JSZip(content);
        let doc = new Docxtemplater().loadZip(zip);
        doc.setData(prepareJson);

        try {
            // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
            doc.render()
        }
        catch (error) {
            let e = {
                message: error.message,
                name: error.name,
                stack: error.stack,
                properties: error.properties,
            };
            console.log(JSON.stringify({error: e}));
            // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
            throw error;
        }
        let out = doc.getZip().generate({
            type: "blob",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }); //Output the document using Data-URI
        saveAs(out, "output.docx")
    });
}

function loadFile(url, callback) {
    JSZipUtils.getBinaryContent(url, callback);
}

function getData() {
    let inputs = document.getElementsByTagName('input');
    for (let i = 0; i < inputs.length; i += 1) {
        let form_value = '';
        switch (inputs[i].getAttribute('id')) {
            case "organization_mentor":
                form_value = document.querySelector('[name=mentor_gender]:checked').value + " " + inputs[i].value;
                break;
            case "chi_req":
                if (document.querySelector('[name=chi_req]:checked').value === "0") {
                    form_value = ["Fair"]
                } else {
                    form_value = []
                }
                break;
            case "eng_req":
                if (document.querySelector('[name=eng_req]:checked').value === "0") {
                    form_value = ["Fair"]
                } else {
                    form_value = []
                }
                break;
            case "put_req":
                if (document.querySelector('[name=put_req]:checked').value === "0") {
                    form_value = ["Fair"]
                } else {
                    form_value = []
                }
                break;
            case "shift_duty":
                form_value = document.querySelector('[name=shift_duty]:checked').value;
                break;
            case "ia_property":
                form_value = document.querySelector('[name=ia_property]:checked').value;
                break;
            case "gender":
                if (document.querySelector('[name=gender]:checked').value === "1") {
                    prepareJson["relationship"] = "son"
                } else {
                    prepareJson["relationship"] = "daughter"
                }
                form_value = document.querySelector('[name=gender]:checked').value;
                break;
            default:
                form_value = inputs[i].value;
        }
        prepareJson[inputs[i].getAttribute('id')] = form_value;
    }
    prepareJson['today'] = today_str;
    prepareJson['allowance_per_day'] = prepareJson['allowance_per_mon'] / 30;
}

function loadJSON() {
    let fileToLoad = document.getElementById("fileToLoad").files[0];

    let fileReader = new FileReader();
    fileReader.onload = function (fileLoadedEvent) {
        prepareJson = JSON.parse(fileLoadedEvent.target.result);
        let keys = Object.keys(prepareJson);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            if (document.getElementById(key)) {
                switch (key) {
                    case "organization_mentor":
                        let p_text = JSON.stringify(prepareJson[key]).replace('"', '').replace('"', '').split(". ");
                        if (p_text[0] === "Dr") {
                            document.getElementsByName("mentor_gender")[0].checked = true;
                        } else if (p_text[0] === "Mr") {
                            document.getElementsByName("mentor_gender")[1].checked = true;
                        } else if (p_text[0] === "Miss") {
                            document.getElementsByName("mentor_gender")[2].checked = true;
                        } else {
                            document.getElementsByName("mentor_gender")[3].checked = true;
                        }
                        document.getElementById(key).value = p_text[1];
                        break;
                    case "chi_req":
                        if (prepareJson[key].length === 0) {
                            document.getElementsByName(key)[1].checked = true;
                        } else {
                            document.getElementsByName(key)[0].checked = true;
                        }
                        break;
                    case "eng_req":
                        if (prepareJson[key].length === 0) {
                            document.getElementsByName(key)[1].checked = true;
                        } else {
                            document.getElementsByName(key)[0].checked = true;
                        }
                        break;
                    case "put_req":
                        if (prepareJson[key].length === 0) {
                            document.getElementsByName(key)[1].checked = true;
                        } else {
                            document.getElementsByName(key)[0].checked = true;
                        }
                        break;
                    case "shift_duty":
                        if (prepareJson[key] === "No") {
                            document.getElementsByName(key)[1].checked = true;
                        } else {
                            document.getElementsByName(key)[0].checked = true;
                        }
                        break;
                    case "ia_property":
                        if (prepareJson[key] === "regular") {
                            document.getElementsByName(key)[0].checked = true;
                        } else if (prepareJson[key] === "request") {
                            document.getElementsByName(key)[1].checked = true;
                        } else {
                            document.getElementsByName(key)[2].checked = true;
                        }
                        break;
                    case "gender":
                        if (prepareJson[key] === "1") {
                            document.getElementsByName(key)[0].checked = true;
                        } else {
                            document.getElementsByName(key)[1].checked = true;
                        }
                        break;
                    default:
                        if (key !== "fileToLoad") {
                            document.getElementById(key).value = prepareJson[key];
                        }
                }
            }
        }
    };
    fileReader.readAsText(fileToLoad, "UTF-8");
    check_all_input();
}
