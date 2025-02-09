let totalMoves = 0;
let minMoves = 0;
let movesLeft = 0;
let numDisks = 0;
let moveSequence = [];
let solving = false;
let paused = false;
let animationTimeout = null;

function startGame() {
    numDisks = parseInt(document.getElementById('num-disks').value);
    const peg1 = document.getElementById('peg1');
    const peg2 = document.getElementById('peg2');
    const peg3 = document.getElementById('peg3');

    peg1.innerHTML = '';
    peg2.innerHTML = '';
    peg3.innerHTML = '';

    minMoves = Math.pow(2, numDisks) - 1;
    totalMoves = 0;
    movesLeft = minMoves;

    document.getElementById('min-moves').innerText = minMoves;
    document.getElementById('moves-left').innerText = movesLeft;
    document.getElementById('total-moves').innerText = totalMoves;

    for (let i = numDisks; i > 0; i--) {
        let disk = document.createElement('div');
        disk.classList.add('disk');
        disk.style.width = `${i * 30}px`;
        disk.style.height = '20px';
        disk.style.backgroundColor = `hsl(${i * 40}, 70%, 50%)`;
        disk.draggable = true;
        disk.id = `disk-${i}`;
        disk.ondragstart = drag;
        peg1.appendChild(disk);
    }

    document.querySelectorAll('.peg').forEach(peg => {
        peg.ondragover = allowDrop;
        peg.ondrop = drop;
    });

    // Reset solving state
    solving = false;
    paused = false;
    document.getElementById('pause-resume-btn').disabled = true;
    document.getElementById('pause-resume-btn').innerText = "Pause";
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    let diskId = event.dataTransfer.getData("text");
    let disk = document.getElementById(diskId);
    let peg = event.target;

    if (peg.classList.contains("peg")) {
        let disks = peg.getElementsByClassName("disk");
        if (disks.length === 0 || parseInt(disk.style.width) < parseInt(disks[disks.length - 1].style.width)) {
            peg.appendChild(disk);
            totalMoves++;
            movesLeft = Math.max(0, minMoves - totalMoves);
            document.getElementById('total-moves').innerText = totalMoves;
            document.getElementById('moves-left').innerText = movesLeft;

            if (peg.id === "peg3" && peg.childElementCount === numDisks) {
                setTimeout(() => alert("Congratulations! You completed the game!"), 200);
            }
        }
    }
}

function solveHanoi(n, fromPeg, toPeg, auxPeg) {
    if (n === 1) {
        moveSequence.push([fromPeg, toPeg]);
        return;
    }
    solveHanoi(n - 1, fromPeg, auxPeg, toPeg);
    moveSequence.push([fromPeg, toPeg]);
    solveHanoi(n - 1, auxPeg, toPeg, fromPeg);
}

function animateSolution() {
    if (paused) return; // Pause execution

    if (!moveSequence.length) {
        solving = false;
        document.getElementById('pause-resume-btn').disabled = true;
        return;
    }

    let [fromId, toId] = moveSequence.shift();
    let fromPeg = document.getElementById(fromId);
    let toPeg = document.getElementById(toId);
    let disk = fromPeg.lastElementChild;

    if (disk) {
        toPeg.appendChild(disk);
    }

    totalMoves++;
    movesLeft = Math.max(0, minMoves - totalMoves);
    document.getElementById('total-moves').innerText = totalMoves;
    document.getElementById('moves-left').innerText = movesLeft;

    // Continue execution after a delay
    animationTimeout = setTimeout(animateSolution, 1500);
}

function startComputerSolution() {
    if (solving) return;

    solving = true;
    paused = false;
    moveSequence = [];
    solveHanoi(numDisks, 'peg1', 'peg3', 'peg2');

    document.getElementById('pause-resume-btn').disabled = false;
    document.getElementById('pause-resume-btn').innerText = "Pause";

    animateSolution();
}

function togglePauseResume() {
    paused = !paused;

    let pauseResumeBtn = document.getElementById('pause-resume-btn');
    if (paused) {
        clearTimeout(animationTimeout); // Stop execution
        pauseResumeBtn.innerText = "Resume";
    } else {
        pauseResumeBtn.innerText = "Pause";
        animateSolution(); // Resume execution
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let computerButton = document.createElement("button");
    computerButton.innerText = "Computer Solution";
    computerButton.onclick = startComputerSolution;
    document.body.insertBefore(computerButton, document.getElementById("layout-container"));

    let pauseResumeButton = document.createElement("button");
    pauseResumeButton.innerText = "Pause";
    pauseResumeButton.id = "pause-resume-btn";
    pauseResumeButton.disabled = true;
    pauseResumeButton.onclick = togglePauseResume;
    document.body.insertBefore(pauseResumeButton, document.getElementById("layout-container"));
});
