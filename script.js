// Tạo giao diện người dùng (UI)
function createUI() {
  // Tạo container cho UI
  const uiContainer = document.createElement("div");
  uiContainer.style.position = "fixed";
  uiContainer.style.bottom = "10px";
  uiContainer.style.right = "10px";
  uiContainer.style.backgroundColor = "white";
  uiContainer.style.border = "1px solid black";
  uiContainer.style.padding = "10px";
  uiContainer.style.zIndex = "1000";

  // Tạo nút "Bắt đầu theo dõi"
  const startButton = document.createElement("button");
  startButton.textContent = "Bắt đầu theo dõi";
  startButton.onclick = startMonitoring;

  // Tạo khu vực log
  const logArea = document.createElement("div");
  logArea.id = "logArea";
  logArea.style.maxHeight = "200px";
  logArea.style.overflowY = "scroll";
  logArea.style.marginTop = "10px";

  // Thêm các thành phần vào container
  uiContainer.appendChild(startButton);
  uiContainer.appendChild(logArea);
  document.body.appendChild(uiContainer);

  logMessage("UI đã được tạo thành công.");
}

// Hàm ghi log vào giao diện
function logMessage(message) {
  const logArea = document.getElementById("logArea");
  if (logArea) {
    const logEntry = document.createElement("p");
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logArea.appendChild(logEntry);
    logArea.scrollTop = logArea.scrollHeight; // Tự động cuộn xuống cuối
  }
}

// Hàm khởi động quá trình theo dõi
function startMonitoring() {
  logMessage("Khởi động quá trình theo dõi.");
  waitForProgressElement();
}

// Hàm chờ phần tử ant-progress xuất hiện
function waitForProgressElement() {
  logMessage("Bắt đầu kiểm tra sự xuất hiện của phần tử ant-progress.");
  const intervalId = setInterval(() => {
    const progressElement = document.querySelector("div.ant-progress");
    if (progressElement) {
      logMessage("Đã tìm thấy phần tử ant-progress.");
      observeProgressStatusChange(progressElement);
      clearInterval(intervalId);
      logMessage("Đã dừng kiểm tra định kỳ sau khi tìm thấy phần tử.");
    } else {
      logMessage("Phần tử ant-progress chưa xuất hiện.");
    }
  }, 500); // Kiểm tra mỗi 500ms

  // Dừng sau 30 giây nếu không tìm thấy
  setTimeout(() => {
    clearInterval(intervalId);
    logMessage("Đã dừng kiểm tra sau 30 giây vì không tìm thấy phần tử.");
  }, 30000);
}

// Hàm theo dõi thay đổi của phần tử ant-progress
function observeProgressStatusChange(progressElement) {
  let currentClass = progressElement.className;
  logMessage("Bắt đầu theo dõi thay đổi của phần tử ant-progress.");

  const checkInterval = setInterval(() => {
    // Kiểm tra phần tử còn tồn tại không
    const stillExists = document.querySelector("div.ant-progress");
    if (!stillExists) {
      logMessage("Phần tử ant-progress không còn tồn tại. Chuyển sang trạng thái chờ.");
      clearInterval(checkInterval);
      
      // Thêm một interval mới để kiểm tra sự xuất hiện lại của phần tử
      const reappearInterval = setInterval(() => {
      const reappeared = document.querySelector("div.ant-progress");
      if (reappeared) {
        logMessage("Phần tử ant-progress đã xuất hiện lại. Tiếp tục theo dõi.");
        clearInterval(reappearInterval);
        observeProgressStatusChange(reappeared); // Bắt đầu theo dõi lại
      }
      }, 1000); // Kiểm tra mỗi 1 giây
      
      return;
    }

    const newClass = progressElement.className;
    const progressBar = document.querySelector(".ant-progress-bg");
    const progressWidth = progressBar ? progressBar.style.width : "0%";

    logMessage(`Trạng thái: Class = ${newClass}, Progress = ${progressWidth}`);

    // Kiểm tra khi progress đạt 100%
    if (progressWidth === "100%") {
      logMessage("Progress đã đạt 100%. Kiểm tra vế trái và vế phải.");
      checkLeftRightEquality();
    }

    // Kiểm tra trạng thái success qua biểu tượng hoặc class
    if (document.querySelector("span.ant-progress-text i") && !progressBar) {
      logMessage("Phát hiện biểu tượng success. Thực hiện nhấn liên kết.");
      handleLinkClick();
    } else if (
      newClass.includes("ant-progress-status-success") &&
      !currentClass.includes("ant-progress-status-success")
    ) {
      logMessage("Class chuyển sang trạng thái success. Thực hiện nhấn liên kết.");
      handleLinkClick();
    }

    currentClass = newClass;
  }, 500); // Kiểm tra mỗi 500ms
}

// Hàm kiểm tra vế trái và vế phải trong phân trang
function checkLeftRightEquality() {
  logMessage("Kiểm tra giá trị phân trang (vế trái/vế phải).");
  const paginationElement = document.querySelector("div.m-l-15.m-r-15");
  if (paginationElement) {
    const textContent = paginationElement.textContent.trim();
    const [left, right] = textContent.split("/").map(Number);

    logMessage(`Giá trị phân trang: ${left} / ${right}`);

    if (left >= right) {
      logMessage("Vế trái >= vế phải. Thực hiện nhấn liên kết.");
      handleLinkClick();
    } else {
      logMessage("Vế trái < vế phải. Thực hiện nhấn nút right.");
      handleRightButtonClick();
    }
  } else {
    logMessage("Không tìm thấy phần tử phân trang.");
  }
}

// Hàm xử lý nhấn liên kết
function handleLinkClick() {
  logMessage("Tìm kiếm liên kết để nhấn.");
  const linkElement = document.querySelector(
    "div.footer-navigator__item.footer-navigator__item-next div.d-flex.align-items-center.flex-gap-10 a"
  );
  if (linkElement) {
    logMessage("Đã tìm thấy liên kết. Thực hiện nhấn.");
    linkElement.click();
  } else {
    logMessage("Không tìm thấy liên kết để nhấn.");
  }
}

// Hàm xử lý nhấn nút right
function handleRightButtonClick() {
  logMessage("Tìm kiếm nút right để nhấn.");
  const rightButton = document.querySelector(
    "button.ant-btn.ant-btn-primary.ant-btn-icon-only i.anticon.anticon-right"
  );
  if (rightButton) {
    logMessage("Đã tìm thấy nút right. Thực hiện nhấn.");
    rightButton.closest("button").click();
  } else {
    logMessage("Không tìm thấy nút right để nhấn.");
  }
}

// Khởi tạo UI khi trang tải xong
window.addEventListener("load", () => {
  logMessage("Trang đã tải xong. Khởi tạo UI.");
  createUI();
});