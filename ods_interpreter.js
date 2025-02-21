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

let odsVariables = {}; // 변수 저장소

function interpretODS(code) {
    let lines = code.split("\n");
    let output = "";

    for (let line of lines) {
        line = line.trim();

        if (line.startsWith(":: print ")) {
            let content = line.replace(":: print ", "").trim();

            // ".." 이후에 문자가 있으면 오류 발생
            if (content.includes(" ..")) {
                let parts = content.split(" ..");
                if (parts.length > 2 || parts[1].trim() !== "") {
                    output += "오류: '..' 뒤에 불필요한 문자가 있습니다.\n";
                    continue;
                }
                content = parts[0].trim();
            } else {
                output += "오류: '..'이 필요합니다.\n";
                continue;
            }

            let resultText = "";

            // 따옴표 기준으로 분리하여 {} 변수 처리
            let parts = content.split(/("[^"]*")/g).filter(Boolean); // 따옴표 유지하며 분리
            parts.forEach(part => {
                if (part.startsWith('"') && part.endsWith('"')) {
                    // 따옴표로 감싸진 문자열은 그대로 출력
                    resultText += part.slice(1, -1);
                } else {
                    // {} 감싸진 변수 치환
                    part = part.replace(/\{(\w+)\}/g, (match, varName) => {
                        return odsVariables[varName] !== undefined ? odsVariables[varName] : `{${varName}}`;
                    });
                    resultText += part;
                }
            });

            output += resultText + "\n";
        }
        else if (line.startsWith(":: let ")) {
            let parts = line.replace(":: let ", "").split(" ..");
            if (parts.length !== 2 || parts[1].trim() !== "") {
                output += "오류: '..' 뒤에 불필요한 문자가 있습니다.\n";
                continue;
            }

            let varAssignment = parts[0].split(" = ");
            if (varAssignment.length === 2) {
                let varName = varAssignment[0].trim();
                let varValue = varAssignment[1].trim();
                odsVariables[varName] = varValue;
            } else {
                output += "오류: 변수 선언 형식이 잘못되었습니다.\n";
            }
        }
        else {
            output += "알 수 없는 명령어: " + line + "\n";
        }
    }

    return output;
}

