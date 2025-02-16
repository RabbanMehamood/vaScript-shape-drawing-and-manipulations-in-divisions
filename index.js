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
  shapeDiv.setAttribute("id", "shape1");
  shapeDiv.setAttribute("draggable", true);

  if (shape.type === "circle") {
    shapeDiv.style.width = shapeDiv.style.height = `${shape.radius * 2}px`;
    shapeDiv.style.borderRadius = "50%";
  } else {
    shapeDiv.style.width = `${shape.width}px`;
    shapeDiv.style.height = `${shape.height}px`;
  }
  animationArea.innerHTML = "";
  animationArea.appendChild(shapeDiv);
}

function allowDrop(event) {
  event.preventDefault();
}

document.querySelectorAll('input[name="shape"]').forEach((input) => {
  input.addEventListener("change", (e) => {
    currentShapeType = e.target.value;
  });
});
