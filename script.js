// Tạo giao diện người dùng (UI)
function createUI() {
  const uiContainer = document.createElement("div");
  uiContainer.style.position = "fixed";
  uiContainer.style.bottom = "10px";
  uiContainer.style.right = "10px";
  uiContainer.style.backgroundColor = "white";
  uiContainer.style.border = "1px solid black";
  uiContainer.style.padding = "10px";
  uiContainer.style.zIndex = "1000";

  const startButton = document.createElement("button");
  startButton.textContent = "Bắt đầu theo dõi";
  startButton.onclick = startMonitoring;

  const downloadButton = document.createElement("button");
  downloadButton.textContent = "Tải body text";
  downloadButton.style.marginLeft = "10px";
  downloadButton.onclick = downloadBodyText;

  const logArea = document.createElement("div");
  logArea.id = "logArea";
  logArea.style.maxHeight = "200px";
  logArea.style.overflowY = "scroll";
  logArea.style.marginTop = "10px";

  uiContainer.appendChild(startButton);
  uiContainer.appendChild(downloadButton);
  uiContainer.appendChild(logArea);
  document.body.appendChild(uiContainer);

  logMessage("UI đã được tạo.");
}

// Hàm ghi log vào giao diện
function logMessage(message) {
  const logArea = document.getElementById("logArea");
  if (logArea) {
    const logEntry = document.createElement("p");
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logArea.appendChild(logEntry);
    logArea.scrollTop = logArea.scrollHeight;
  }
}

// Hàm tải toàn bộ body text về dạng file
function downloadBodyText() {
  const bodyText = document.body.textContent || document.body.innerText;
  const blob = new Blob([bodyText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "body_text.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  logMessage("Đã tải body text.");
}

// Hàm kiểm tra phần trăm tiến độ khóa học
function checkCourseProgress() {
  const progressElement = document.querySelector(".course-progress") || document.body; // Thay đổi selector nếu cần
  const bodyText = progressElement.textContent || progressElement.innerText;
  const progressMatch = bodyText.match(/(\d+)%/);
  return progressMatch ? parseInt(progressMatch[1], 10) : null;
}

// Hàm khởi động quá trình theo dõi
function startMonitoring() {
  logMessage("Bắt đầu theo dõi.");
  waitForProgressElement();
  checkContentUnavailableLoop();
  checkCourseProgressLoop();
}

// Biến để kiểm soát trạng thái sau khi quay lại
let justWentBack = false;

// Hàm kiểm tra thông báo "BẠN KHÔNG THỂ XEM NỘI DUNG NÀY" liên tục
function checkContentUnavailableLoop() {
  const intervalId = setInterval(() => {
    if (checkContentUnavailable()) {
      clearInterval(intervalId);
      justWentBack = true;
      setTimeout(() => {
        justWentBack = false;
        checkContentUnavailableLoop();
      }, 5000);
    }
  }, 500);
}

// Hàm kiểm tra tiến độ khóa học liên tục và gộp log với ant-progress
function checkCourseProgressLoop() {
  const intervalId = setInterval(() => {
    const courseProgress = checkCourseProgress();
    const progressBar = document.querySelector(".ant-progress-bg");
    const lessonProgress = progressBar ? progressBar.style.width : "0%";
    logMessage(`Tiến độ: Khóa học = ${courseProgress !== null ? courseProgress : "N/A"}%, Bài học = ${lessonProgress}`);
    
    if (courseProgress === 100) {
      logMessage("Khóa học hoàn thành 100%. Dừng theo dõi.");
      clearInterval(intervalId);
    }
  }, 5000); // Kiểm tra mỗi 5 giây
}

// Hàm chờ phần tử ant-progress xuất hiện
function waitForProgressElement() {
  const intervalId = setInterval(() => {
    const progressElement = document.querySelector("div.ant-progress");
    if (progressElement) {
      observeProgressStatusChange(progressElement);
      clearInterval(intervalId);
    }
  }, 500);

  setTimeout(() => {
    clearInterval(intervalId);
  }, 30000);
}

// Hàm theo dõi thay đổi của phần tử ant-progress
function observeProgressStatusChange(progressElement) {
  let currentClass = progressElement.className;
  const checkInterval = setInterval(() => {
    const stillExists = document.querySelector("div.ant-progress");
    if (!stillExists) {
      clearInterval(checkInterval);
      waitForProgressElement();
      return;
    }

    const newClass = progressElement.className;
    const progressBar = document.querySelector(".ant-progress-bg");
    const progressWidth = progressBar ? progressBar.style.width : "0%";

    if (progressWidth === "100%") {
      checkLeftRightEquality();
    }

    if (!justWentBack && document.querySelector("span.ant-progress-text i") && !progressBar) {
      handleLinkClick();
    } else if (
      !justWentBack &&
      newClass.includes("ant-progress-status-success") &&
      !currentClass.includes("ant-progress-status-success")
    ) {
      handleLinkClick();
    }

    currentClass = newClass;
  }, 500);
}

// Hàm kiểm tra thông báo "BẠN KHÔNG THỂ XEM NỘI DUNG NÀY"
function checkContentUnavailable() {
  const bodyText = document.body.textContent || document.body.innerText;
  if (bodyText.includes("BẠN KHÔNG THỂ XEM NỘI DUNG NÀY")) {
    logMessage("Phát hiện thông báo khóa nội dung. Quay lại.");
    handleBackClick();
    return true;
  }
  return false;
}

// Hàm xử lý nhấn nút "Mục trước"
function handleBackClick() {
  const backLink = document.querySelector("a[href*='Đạo đức C4 - 3']") ||
    document.querySelector("div.footer-navigator__item.footer-navigator__item-prev a");

  if (backLink) {
    backLink.click();
  } else {
    window.history.back();
  }
}

// Hàm kiểm tra vế trái và vế phải trong phân trang
function checkLeftRightEquality() {
  const paginationElement = document.querySelector("div.m-l-15.m-r-15");
  if (paginationElement) {
    const [left, right] = paginationElement.textContent.trim().split("/").map(Number);
    if (left >= right) {
      handleLinkClick();
    } else {
      handleRightButtonClick();
    }
  }
}

// Hàm xử lý nhấn liên kết "Tiếp theo"
function handleLinkClick() {
  const linkElement = document.querySelector("div.footer-navigator__item.footer-navigator__item-next a");
  if (linkElement) {
    linkElement.click();
  }
}

// Hàm xử lý nhấn nút right
function handleRightButtonClick() {
  const rightButton = document.querySelector("button.ant-btn.ant-btn-primary.ant-btn-icon-only i.anticon.anticon-right");
  if (rightButton) {
    rightButton.closest("button").click();
  }
}

// Khởi tạo UI khi trang tải xong
window.addEventListener("load", () => {
  createUI();
});