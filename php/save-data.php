<?php
require_once 'config.php';

// التحقق من صلاحيات المدير
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'غير مصرح به']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';

switch($action) {
    
    case 'update_settings':
        $settings = $data['settings'] ?? [];
        $errors = [];
        foreach ($settings as $key => $value) {
            // التحقق إذا كان المفتاح موجود
            $existing = supabase_request("settings?setting_key=eq.$key&select=id");
            if (!empty($existing) && is_array($existing) && isset($existing[0]['id'])) {
                // تحديث — استخدام PATCH وليس PUT
                $id = $existing[0]['id'];
                $res = supabase_request("settings?id=eq.$id", 'PATCH', ['setting_value' => $value]);
            } else {
                // إضافة جديد
                $res = supabase_request('settings', 'POST', [
                    'setting_key' => $key,
                    'setting_value' => $value
                ]);
            }
        }
        echo json_encode(['success' => true, 'message' => 'تم حفظ الإعدادات']);
        break;
    
    case 'add_gallery':
        $result = supabase_request('gallery', 'POST', [
            'image_url' => $data['image_url'] ?? '',
            'emoji'     => $data['emoji'] ?? '📷',
            'caption'   => $data['caption'] ?? '',
            'display_order' => intval($data['display_order'] ?? 0)
        ]);
        echo json_encode(['success' => true, 'message' => 'تمت إضافة الصورة']);
        break;
    
    case 'delete_gallery':
        $id = intval($data['id']);
        supabase_request("gallery?id=eq.$id", 'DELETE');
        echo json_encode(['success' => true, 'message' => 'تم حذف الصورة']);
        break;
    
    case 'update_faq':
        $question = $data['question'] ?? '';
        $answer   = $data['answer'] ?? '';
        $id       = intval($data['id'] ?? 0);
        
        if ($id > 0) {
            // تحديث موجود
            supabase_request("faq?id=eq.$id", 'PATCH', [
                'question' => $question,
                'answer'   => $answer
            ]);
        } else {
            // إضافة جديد
            supabase_request('faq', 'POST', [
                'question'      => $question,
                'answer'        => $answer,
                'display_order' => 0
            ]);
        }
        echo json_encode(['success' => true, 'message' => 'تم حفظ السؤال']);
        break;
    
    case 'delete_faq':
        $id = intval($data['id']);
        supabase_request("faq?id=eq.$id", 'DELETE');
        echo json_encode(['success' => true, 'message' => 'تم حذف السؤال']);
        break;
    
    default:
        echo json_encode(['success' => false, 'message' => 'إجراء غير معروف']);
}
?>
