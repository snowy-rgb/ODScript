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

            // ".." 뒤에 추가 코드가 들어가면 제거
            if (content.includes(" ..")) {
                content = content.split(" ..")[0];
            }

            // 변수 처리 - {} 안의 변수를 실제 값으로 변환
            content = content.replace(/\{(\w+)\}/g, (match, varName) => {
                return odsVariables[varName] !== undefined ? odsVariables[varName] : `{${varName}}`;
            });

            // "" 내부 내용만 출력
            let match = content.match(/^"(.*)"$/);
            if (match) {
                output += match[1] + "\n";
            } else {
                output += "오류: 올바른 문자열 형식이 아닙니다.\n";
            }
        }
        else if (line.startsWith(":: let ")) {
            let parts = line.replace(":: let ", "").replace(" ..", "").split(" = ");
            if (parts.length === 2) {
                let varName = parts[0].trim();
                let varValue = parts[1].trim();
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
