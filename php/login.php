<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';

if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'يرجى إدخال اسم المستخدم وكلمة المرور']);
    exit;
}

$result = supabase_request("users?username=eq.$username&select=*");

if (!empty($result) && is_array($result) && isset($result[0]['password'])) {
    if (password_verify($password, $result[0]['password'])) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $username;
        echo json_encode(['success' => true, 'message' => 'تم تسجيل الدخول بنجاح']);
    } else {
        echo json_encode(['success' => false, 'message' => 'كلمة المرور غير صحيحة']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'اسم المستخدم غير موجود']);
}
?>
