document.getElementById("run-button").addEventListener("click", function () {
    let code = document.getElementById("code-editor").value;
    let outputArea = document.getElementById("terminal-output");
    let terminalArea = document.getElementById("console-output");

    try {
        let { result, jsCode } = interpretODS(code);
        outputArea.textContent = result;

        // 터미널에 실제 실행된 JavaScript 코드 표시
        terminalArea.textContent = "실행된 JavaScript 코드:\n" + jsCode;
    } catch (error) {
        outputArea.textContent = "오류 발생: " + error.message;
        terminalArea.textContent = "실행 오류: " + error.message;
    }
});

let odsVariables = {}; // 변수 저장소

function interpretODS(code) {
    let lines = code.split("\n");
    let output = "";
    let jsCode = ""; // 변환된 JavaScript 코드 저장

    for (let line of lines) {
        line = line.trim();

        if (line.startsWith(":: let ")) {
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

                // JavaScript 변환 코드 저장
                jsCode += `let ${varName} = ${varValue};\n`;
            } else {
                output += "오류: 변수 선언 형식이 잘못되었습니다.\n";
            }
        }
        else if (line.startsWith(":: print ")) {
            let content = line.replace(":: print ", "").trim();

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
            let parts = content.split(/("[^"]*")/g).filter(Boolean);
            parts.forEach(part => {
                if (part.startsWith('"') && part.endsWith('"')) {
                    resultText += part.slice(1, -1);
                } else {
                    part = part.replace(/\{(\w+)\}/g, (match, varName) => {
                        return odsVariables[varName] !== undefined ? odsVariables[varName] : `{${varName}}`;
                    });
                    resultText += part;
                }
            });

            output += resultText + "\n";
            jsCode += `console.log(${content.replace(/\{(\w+)\}/g, "$1")});\n`; // JavaScript 코드 변환
        }
        else {
            output += "알 수 없는 명령어: " + line + "\n";
        }
    }

    return { result: output, jsCode: jsCode };
}

// 코드 입력 시 줄 번호 업데이트
const codeEditor = document.getElementById("code-editor");
const lineNumbers = document.getElementById("line-numbers");

codeEditor.addEventListener("input", updateLineNumbers);
codeEditor.addEventListener("scroll", syncScroll);

function updateLineNumbers() {
    const lines = codeEditor.value.split("\n").length;
    let lineNumberHTML = "";
    for (let i = 1; i <= lines; i++) {
        lineNumberHTML += i + "<br>";
    }
    lineNumbers.innerHTML = lineNumberHTML;

    // 줄 번호 높이 동기화
    lineNumbers.style.height = codeEditor.scrollHeight + "px";
}

function syncScroll() {
    lineNumbers.scrollTop = codeEditor.scrollTop;
}
