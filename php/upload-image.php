<?php
require_once 'config.php';

// التحقق من صلاحيات المدير
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'غير مصرح به']);
    exit;
}

$upload_dir = '../uploads/';
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['image'];
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = time() . '_' . uniqid() . '.' . $extension;
    $target_path = $upload_dir . $filename;
    
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $ext = strtolower($extension);
    
    if (!in_array($ext, $allowed)) {
        echo json_encode(['success' => false, 'message' => 'نوع الملف غير مسموح']);
        exit;
    }
    
    if (move_uploaded_file($file['tmp_name'], $target_path)) {
        $url = 'uploads/' . $filename;
        echo json_encode(['success' => true, 'url' => $url, 'message' => 'تم رفع الصورة بنجاح']);
    } else {
        echo json_encode(['success' => false, 'message' => 'فشل في رفع الملف']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'لم يتم إرسال أي ملف']);
}
?>