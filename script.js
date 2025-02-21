import { handleCommand } from "commands.js";

document.getElementById("run-button").addEventListener("click", function () {
    let code = document.getElementById("code-editor").value;
    let outputArea = document.getElementById("terminal-output");
    let terminalArea = document.getElementById("console-output");

    try {
        let { result, jsCode } = interpretODS(code);
        outputArea.textContent = result;
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
    let jsCode = "";
    let isInsideIfBlock = false; // if문 내부인지 확인

    for (let line of lines) {
        line = line.trim();

        // 명령어 핸들러로 처리
        let result = handleCommand(line, odsVariables, isInsideIfBlock);
        output += result.output;
        jsCode += result.jsCode;

        // if 문이 끝났는지 확인
        if (line === "..") {
            isInsideIfBlock = false;
        }
    }

    return { result: output, jsCode: jsCode };
}
