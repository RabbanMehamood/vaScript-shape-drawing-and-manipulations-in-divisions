const drawingCanvas = document.getElementById("drawingCanvas");
const drawingCtx = drawingCanvas.getContext("2d");
const animationArea = document.getElementById("animationArea");
let shapes = [];
let selectedShape = null;
let isDragging = false;
let offsetX, offsetY;
let currentShapeType = "rectangle";

drawingCanvas.width = 400;
drawingCanvas.height = 400;

function createShape(type, x, y) {
  return {
    type,
    x,
    y,
    width: type === "rectangle" ? 165 : 75,
    height: type === "rectangle" ? 70 : 60,
    radius: type === "circle" ? 40 : 0, // Circle’s radius
    color: "#FF0000",
  };
}

function drawShapes() {
  drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

  shapes.forEach((shape) => {
    drawingCtx.fillStyle = shape.color;
    if (shape.type === "circle") {
      drawingCtx.beginPath();
      // Draw circle using its bounding box: center at (x+radius, y+radius)
      drawingCtx.arc(
        shape.x + shape.radius,
        shape.y + shape.radius,
        shape.radius,
        0,
        2 * Math.PI
      );
      drawingCtx.fill();
    } else {
      drawingCtx.fillRect(shape.x, shape.y, shape.width, shape.height);
    }
  });
}

drawingCanvas.addEventListener("mousedown", (e) => {
  // Calculate mouse coordinates relative to the canvas
  const rect = drawingCanvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Check if an existing shape is clicked
  selectedShape = shapes.find((shape) => {
    if (shape.type === "circle") {
      const distance = Math.sqrt(
        (mouseX - (shape.x + shape.radius)) ** 2 +
          (mouseY - (shape.y + shape.radius)) ** 2
      );
      return distance <= shape.radius;
    } else {
      return (
        mouseX >= shape.x &&
        mouseX <= shape.x + shape.width &&
        mouseY >= shape.y &&
        mouseY <= shape.y + shape.height
      );
    }
  });

  if (selectedShape) {
    // Start dragging the existing shape
    isDragging = true;
    offsetX = mouseX - selectedShape.x;
    offsetY = mouseY - selectedShape.y;
  } else {
    // Create a new shape if none was clicked
    selectedShape = createShape(currentShapeType, mouseX, mouseY - 5);
    shapes = [];
    shapes.push(selectedShape);
    drawShapes();
    isDragging = true;
    offsetX = mouseX - selectedShape.x;
    offsetY = mouseY - selectedShape.y;
  }
});

// Listen on document to capture mouse movements outside the canvas
document.addEventListener("mousemove", (e) => {
  if (!isDragging || !selectedShape) return;

  // Compute mouse position relative to the canvas
  const rect = drawingCanvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  selectedShape.x = mouseX - offsetX;
  selectedShape.y = mouseY - offsetY;

  let isAtRightEdge = false;
  if (selectedShape.type === "circle") {
    // Check if the entire circle (bounding box: 2*radius) reaches the canvas edge
    isAtRightEdge =
      selectedShape.x + selectedShape.radius * 2 >= drawingCanvas.width;
  } else {
    // For rectangle/square
    isAtRightEdge =
      selectedShape.x + selectedShape.width >= drawingCanvas.width;
  }

  if (isAtRightEdge) {
    createDivShape(selectedShape);
    shapes = [];
    isDragging = false;
    selectedShape = null;
  }

  drawShapes();
});

// Listen on document to capture mouseup even if outside canvas
document.addEventListener("mouseup", () => {
  isDragging = false;
});

drawingCanvas.addEventListener("dblclick", (e) => {
  const rect = drawingCanvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  selectedShape = shapes.find((shape) => {
    if (shape.type === "circle") {
      const distance = Math.sqrt(
        (mouseX - (shape.x + shape.radius)) ** 2 +
          (mouseY - (shape.y + shape.radius)) ** 2
      );
      return distance <= shape.radius;
    } else {
      return (
        mouseX >= shape.x &&
        mouseX <= shape.x + shape.width &&
        mouseY >= shape.y &&
        mouseY <= shape.y + shape.height
      );
    }
  });

  if (selectedShape) {
    createDivShape(selectedShape);
    shapes = shapes.filter((shape) => shape !== selectedShape);
    selectedShape = null;
    drawShapes();
  }
});

function createDivShape(shape) {
  const shapeDiv = document.createElement("div");
  shapeDiv.classList.add("shape");
  shapeDiv.style.backgroundColor = shape.color;

  shapeDiv.setAttribute("draggable", true);
  shapeDiv.style.position = "absolute";

  if (shape.type === "circle") {
    shapeDiv.style.width = shapeDiv.style.height = `${shape.radius * 2}px`;
    shapeDiv.style.borderRadius = "50%";
    shapeDiv.setAttribute("id", "shape3");
  } else if (shape.type === "rectangle") {
    shapeDiv.style.width = `${shape.width}px`;
    shapeDiv.style.height = `${shape.height}px`;

    shapeDiv.setAttribute("id", "shape1");
  } else {
    shapeDiv.style.width = `${shape.width}px`;
    shapeDiv.style.height = `${shape.height}px`;
    shapeDiv.setAttribute("id", "shape2");
  }

  shapeDiv.addEventListener("dragstart", dragstartHandler);
  animationArea.innerHTML = "";
  animationArea.appendChild(shapeDiv);
  addEventListenersToShapeDiv(shapeDiv);
}

function addEventListenersToShapeDiv(shapeDiv) {
  shapeDiv.addEventListener("click", () => {
    const parentDiv = shapeDiv.parentElement.id;
    if (parentDiv === "animationArea") {
      document
        .getElementById("animateHorizontally")
        .addEventListener("click", () => {
          animateShape(shapeDiv, "horizontal");
        });
      document
        .getElementById("animateVertically")
        .addEventListener("click", () => {
          animateShape(shapeDiv, "vertical");
        });
    } else if (parentDiv === "deletionArea") {
      document.getElementById("deleteButton").addEventListener("click", () => {
        deleteShape(shapeDiv);
      });
    }
  });
}

function animateShape(shapeDiv, direction) {
  let position = 0;
  const id = setInterval(frame, 5);
  function frame() {
    if (position === 350) {
      clearInterval(id);
    } else {
      position++;
      if (direction === "horizontal") {
        shapeDiv.style.left = position + "px";
      } else if (direction === "vertical") {
        shapeDiv.style.top = position + "px";
      }
    }
  }
}

function deleteShape(shapeDiv) {
  const deletionTime = new Date().toLocaleTimeString();
  const deletionLog = document.createElement("div");
  deletionLog.textContent = `Shape deleted at: ${deletionTime}`;
  document.getElementById("deletionLog").appendChild(deletionLog);
  shapeDiv.remove();
}

function allowDrop(event) {
  event.preventDefault();
}

function dragstartHandler(ev) {
  // Add the target element's id to the data transfer object
  ev.dataTransfer.setData("text/plain", ev.target.id);
  ev.dataTransfer.dropEffect = "move";
}

function dragoverHandler(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = "move";
}
function dropHandler(ev) {
  ev.preventDefault();
  // Get the id of the target and add the moved element to the target's DOM
  const data = ev.dataTransfer.getData("text/plain");
  ev.target.appendChild(document.getElementById(data));
}

document.querySelectorAll('input[name="shape"]').forEach((input) => {
  input.addEventListener("change", (e) => {
    currentShapeType = e.target.value;
  });
});

document.getElementById("colorPicker").addEventListener("change", () => {
  const chosenColor = document.getElementById("colorPicker").value;
  const shapeDiv = document.getElementById("modificationArea").children[0];
  if (shapeDiv && shapeDiv.parentElement.id === "modificationArea") {
    shapeDiv.style.backgroundColor = chosenColor;
  }
});

document.getElementById("resize").addEventListener("change", () => {
  const chosenSize = document.getElementById("resize").value;
  const shapeDiv = document.getElementById("modificationArea").children[0];
  if (document.getElementById("modificationArea").children[0].id === "shape1") {
    let widthMore = parseInt(chosenSize);
    widthMore += 80;
    shapeDiv.style.width = `${widthMore}px`;
    shapeDiv.style.height = `${chosenSize}px`;
  } else if (shapeDiv && shapeDiv.parentElement.id === "modificationArea") {
    shapeDiv.style.width = `${chosenSize}px`;
    shapeDiv.style.height = `${chosenSize}px`;
  }
});

document.getElementById("calculateAreaBtn").addEventListener("click", () => {
  if (document.getElementById("modificationArea").children[0].id === "shape3") {
    document.getElementById("areaResult").textContent =
      Math.ceil(
        Math.PI *
          Math.pow(
            parseFloat(document.getElementById("shape3").style.width) / 2,
            2
          )
      ) + "square pixels";
  } else if (
    document.getElementById("modificationArea").children[0].id === "shape2" ||
    "shape1"
  ) {
    document.getElementById("areaResult").textContent =
      2 *
        parseFloat(
          document.getElementById("modificationArea").children[0].style.width
        ) +
      "square pixels";
  }
});

document.getElementById("deleteShapeBtn").addEventListener("click", () => {
  if (document.getElementById("deletionArea").children[0] !== undefined) {
    let shapeElement = document.getElementById("deletionArea").children[0];
    let shapeName = shapeElement.id; //
    let deletedTime = new Date().toLocaleTimeString();
    document.getElementById("deletionArea").removeChild(shapeElement);
    let liItem = document.createElement("li");
    liItem.textContent = shapeName + " deleted at " + deletedTime;
    document.getElementById("deletedShapesList").appendChild(liItem);
  }
});

document.getElementById("anmtHorizontal").addEventListener("click", () => {
  const shape = document.getElementById("animationArea").children[0];

  // Remove previous animation classes if any
  shape.classList.remove("move-vertical");
  // Add horizontal movement animation class
  shape.classList.add("move-horizontal");
});

document.getElementById("anmtVertical").addEventListener("click", () => {
  const shape = document.getElementById("animationArea").children[0];

  // Remove previous animation classes if any
  shape.classList.remove("move-horizontal");
  // Add vertical movement animation class
  shape.classList.add("move-vertical");
});
