<?php
require_once 'config.php';

$type = $_GET['type'] ?? '';

switch($type) {
    
    case 'settings':
        $result = supabase_request('settings?select=*');
        $settings = [];
        if ($result) {
            foreach ($result as $row) {
                $settings[$row['setting_key']] = $row['setting_value'];
            }
        }
        echo json_encode(['success' => true, 'data' => $settings]);
        break;
    
    case 'gallery':
        $result = supabase_request('gallery?select=*&order=display_order.asc');
        echo json_encode(['success' => true, 'data' => $result ?: []]);
        break;
    
    case 'faqs':
        $result = supabase_request('faq?select=*&order=display_order.asc');
        echo json_encode(['success' => true, 'data' => $result ?: []]);
        break;
    
    default:
        echo json_encode(['success' => false, 'error' => 'Invalid type']);
}
?>