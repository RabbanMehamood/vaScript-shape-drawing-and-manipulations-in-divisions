const drawingCanvas = document.getElementById("drawingCanvas");
const drawingCtx = drawingCanvas.getContext("2d");
let shapes = [];
let selectedShape = null;
let isDragging = false;
let offsetX, offsetY;
let currentShapeType = "rectangle"; // Default shape type

drawingCanvas.width = 400; // Set canvas width
drawingCanvas.height = 400; // Set canvas height

// Function to create a shape object
function createShape(type, x, y) {
  const shape = {
    type,
    x,
    y,
    width: 100,
    height: 100,
    radius: 50,
    color: "#FF0000",
  };

  if (type === "square") {
    shape.width = 80;
    shape.height = 80;
  } else if (type === "rectangle") {
    shape.width = 200;
    shape.height = 50;
  } else if (type === "circle") {
    shape.radius = 25;
  }
  return shape;
}

// Draw a shape on the canvas
function drawShape(shape) {
  if (!shape) {
    console.error("Shape is null or undefined");
    return;
  }

  drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

  if (shape.type === "rectangle" || shape.type === "square") {
    drawingCtx.fillStyle = shape.color;
    drawingCtx.fillRect(shape.x, shape.y, shape.width, shape.height);
  } else if (shape.type === "circle") {
    drawingCtx.fillStyle = shape.color;
    drawingCtx.beginPath();
    drawingCtx.arc(
      shape.x + shape.radius,
      shape.y + shape.radius,
      shape.radius,
      0,
      2 * Math.PI
    );
    drawingCtx.fill();
  }
}

// Function to handle mousedown event for drawing shape
drawingCanvas.addEventListener("mousedown", (e) => {
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;
  const shape = createShape(currentShapeType, mouseX, mouseY);
  shapes.push(shape);
  drawShape(shape);
});

// Function to handle double-click event for selecting shape
drawingCanvas.addEventListener("dblclick", (e) => {
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;
  const shape = shapes.find((shape) => {
    if (shape.type === "rectangle" || shape.type === "square") {
      return (
        mouseX >= shape.x &&
        mouseX <= shape.x + shape.width &&
        mouseY >= shape.y &&
        mouseY <= shape.y + shape.height
      );
    } else if (shape.type === "circle") {
      const dist = Math.sqrt(
        Math.pow(mouseX - (shape.x + shape.radius), 2) +
          Math.pow(mouseY - (shape.y + shape.radius), 2)
      );
      return dist <= shape.radius;
    }
    return false;
  });

  if (shape) {
    isDragging = true;
    offsetX = mouseX - shape.x;
    offsetY = mouseY - shape.y;
    selectedShape = shape;
  }
});

// Function to handle mousemove event for dragging shape
drawingCanvas.addEventListener("mousemove", (e) => {
  if (isDragging && selectedShape) {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    // Update the position of the shape while dragging
    selectedShape.x = mouseX - offsetX;
    selectedShape.y = mouseY - offsetY;

    // Check if the shape touches the right edge of the canvas
    if (
      selectedShape.x + selectedShape.width >= drawingCanvas.width ||
      selectedShape.x + selectedShape.radius >= drawingCanvas.width
    ) {
      // Create a new div in the animation area
      const animateDiv = document.getElementById("animationArea");
      const shapeDiv = document.createElement("div");
      shapeDiv.classList.add("shape");
      shapeDiv.style.backgroundColor = selectedShape.color;

      if (
        selectedShape.type === "rectangle" ||
        selectedShape.type === "square"
      ) {
        shapeDiv.style.width = `${selectedShape.width}px`;
        shapeDiv.style.height = `${selectedShape.height}px`;
        shapeDiv.style.left = `${selectedShape.x}px`;
        shapeDiv.style.top = `${selectedShape.y}px`;
      } else if (selectedShape.type === "circle") {
        shapeDiv.classList.add("circle");
        shapeDiv.style.width = `${selectedShape.radius * 2}px`;
        shapeDiv.style.height = `${selectedShape.radius * 2}px`;
        shapeDiv.style.left = `${selectedShape.x - selectedShape.radius}px`;
        shapeDiv.style.top = `${selectedShape.y - selectedShape.radius}px`;
      }

      shapeDiv.setAttribute("draggable", "true");
      animateDiv.appendChild(shapeDiv);

      // Remove the shape from the canvas
      shapes = shapes.filter((s) => s !== selectedShape);
      drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      isDragging = false;
      selectedShape = null;
    }
    drawShape(selectedShape);
  }
});

// Function to handle mouseup event to stop dragging
drawingCanvas.addEventListener("mouseup", () => {
  isDragging = false;
  selectedShape = null;
});

// Create a new shape when a radio button is selected
document.querySelectorAll('input[name="shape"]').forEach((input) => {
  input.addEventListener("change", (e) => {
    currentShapeType = e.target.value;
  });
});

// Initial shape creation
createShape("rectangle");
