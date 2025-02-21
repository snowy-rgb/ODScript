function runODS() {
    let code = document.getElementById("code").value;
    let outputArea = document.getElementById("output");

    try {
        let result = interpretODS(code);
        outputArea.textContent = result;
    } catch (error) {
        outputArea.textContent = "오류 발생: " + error.message;
    }
}

function interpretODS(code) {
    let lines = code.split("\n");
    let output = "";

    for (let line of lines) {
        line = line.trim();
        
        if (line.startsWith(":: print ")) {
            let content = line.replace(":: print ", "").replace(" ..", "");
            output += content + "\n";
        }
        else if (line.startsWith(":: let ")) {
            let parts = line.replace(":: let ", "").replace(" ..", "").split(" = ");
            let varName = parts[0].trim();
            let varValue = parts[1].trim();
            window[varName] = varValue;
        }
        else if (line.startsWith(":: if ")) {
            output += "(조건문 해석은 아직 추가되지 않음)\n";
        }
        else {
            output += "알 수 없는 명령어: " + line + "\n";
        }
    }

    return output;
}
