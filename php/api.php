<?php
require_once 'config.php';

$action = $_GET['action'] ?? '';

switch($action) {
    
    case 'get_settings':
        // جلب الإعدادات
        $result = supabase_request('settings?select=*');
        $settings = [];
        if ($result && is_array($result)) {
            foreach ($result as $row) {
                if (isset($row['setting_key'])) {
                    $settings[$row['setting_key']] = $row['setting_value'];
                }
            }
        }
        // جلب المعرض
        $gallery = supabase_request('gallery?select=*&order=display_order.asc');
        // جلب الأسئلة الشائعة
        $faqs = supabase_request('faq?select=*&order=display_order.asc');
        
        echo json_encode([
            'success' => true,
            'settings' => $settings,
            'gallery' => $gallery ?: [],
            'faqs' => $faqs ?: []
        ]);
        break;
    
    case 'get_gallery':
        $result = supabase_request('gallery?select=*&order=display_order.asc');
        echo json_encode(['success' => true, 'gallery' => $result ?: []]);
        break;
    
    case 'get_faqs':
        $result = supabase_request('faq?select=*&order=display_order.asc');
        echo json_encode(['success' => true, 'faqs' => $result ?: []]);
        break;
    
    case 'send_help':
        $data = json_decode(file_get_contents('php://input'), true);
        $result = supabase_request('help_requests', 'POST', $data);
        echo json_encode(['success' => true, 'message' => 'تم إرسال طلب المساعدة']);
        break;
    
    case 'login':
        $postData = json_decode(file_get_contents('php://input'), true);
        $username = $postData['username'] ?? '';
        $password = $postData['password'] ?? '';
        
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
        break;
    
    case 'check_auth':
        $logged_in = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
        echo json_encode(['logged_in' => $logged_in]);
        break;
    
    case 'logout':
        session_destroy();
        echo json_encode(['success' => true]);
        break;
    
    default:
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
}
?>
