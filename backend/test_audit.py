import requests

BASE = 'http://127.0.0.1:8000/api'
print('=== RUNNING COMPREHENSIVE BACKEND AUDIT ===')

# 1. Health
r = requests.get(f'{BASE}/health')
assert r.status_code == 200, f'Health failed: {r.status_code}'
print('[PASS] 1. Health Check')

# 2. Login demo user
r = requests.post(f'{BASE}/auth/login', json={'username': 'demo', 'password': 'demo123'})
assert r.status_code == 200, f'Login failed: {r.status_code}'
token = r.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}
print('[PASS] 2. Authentication (Login & JWT)')

# 3. Get /me
r = requests.get(f'{BASE}/auth/me', headers=headers)
assert r.status_code == 200, f'Me failed: {r.status_code}'
print('[PASS] 3. Current User Profile (/me)')

# 4. Restaurant Profile
r = requests.get(f'{BASE}/restaurant', headers=headers)
assert r.status_code == 200, f'Restaurant get failed: {r.status_code}'
rest = r.json()
slug = rest['slug']
print(f'[PASS] 4. Restaurant Profile (Slug: {slug})')

# 5. Categories
r = requests.get(f'{BASE}/categories', headers=headers)
assert r.status_code == 200, f'Categories failed: {r.status_code}'
cats = r.json()
assert len(cats) > 0, 'No categories found'
print(f'[PASS] 5. Categories List ({len(cats)} categories)')

# 6. Menu Items
r = requests.get(f'{BASE}/menu', headers=headers)
assert r.status_code == 200, f'Menu items failed: {r.status_code}'
items = r.json()
print(f'[PASS] 6. Menu Items List ({len(items)} items)')

# 7. Public Menu
r = requests.get(f'{BASE}/public/menu/{slug}')
assert r.status_code == 200, f'Public menu failed: {r.status_code}'
print('[PASS] 7. Public Digital Menu API')

# 8. Razorpay Order Creation
r = requests.post(f'{BASE}/orders/razorpay/create-order', json={'amount': 150, 'restaurant_slug': slug})
assert r.status_code == 200, f'Razorpay order creation failed: {r.status_code}'
rzp = r.json()
print(f"[PASS] 8. Razorpay Order Creation (Order ID: {rzp['order_id']})")

# 9. Order Placement (Online Paid)
r = requests.post(f'{BASE}/orders', json={
    'restaurant_slug': slug,
    'customer_name': 'Audit Tester',
    'table_number': '12',
    'payment_method': 'online',
    'razorpay_order_id': rzp['order_id'],
    'razorpay_payment_id': 'pay_test_audit_123',
    'items': [{'menu_item_id': items[0]['id'], 'item_name': items[0]['name'], 'quantity': 1, 'price': items[0]['price']}]
})
assert r.status_code == 200, f'Order place failed: {r.status_code}'
order_id = r.json()['id']
print(f'[PASS] 9. Order Placement & Online Verification (Order #{order_id})')

# 10. Order Status Update
r = requests.put(f'{BASE}/orders/{order_id}/status', headers=headers, json={'status': 'preparing'})
assert r.status_code == 200, f'Order status update failed: {r.status_code}'
print('[PASS] 10. Order Status Lifecycle')

# 11. QR Code Endpoints
r = requests.get(f'{BASE}/qr/image/{slug}')
assert r.status_code == 200, f'QR Image failed: {r.status_code}'
print('[PASS] 11. QR Code Inline Image Generation')

# 12. Analytics
r = requests.get(f'{BASE}/analytics', headers=headers)
assert r.status_code == 200, f'Analytics failed: {r.status_code}'
print('[PASS] 12. Dashboard Analytics Metrics')

# 13. AI Status
r = requests.get(f'{BASE}/ai/status')
assert r.status_code == 200, f'AI status failed: {r.status_code}'
print(f"[PASS] 13. AI Service Endpoint (Provider: {r.json()['provider']})")

print('=== ALL 13 ENDPOINTS AUDITED AND PASSING (100% HEALTHY) ===')
