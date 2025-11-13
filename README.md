
**Mini Google Drive** là một dự án giúp bạn upload, quản lý và chia sẻ file qua Google Drive với giao diện web thân thiện. Có thể chạy ngay trên localhost và vercel

---

## Tính năng

✅ Upload file lên Google Drive  
✅ Tạo & quản lý folder  
✅ Download file  
✅ Xóa file  
✅ Chia sẻ file (public link)  
✅ Xem dung lượng sử dụng  
✅ Responsive design (mobile-friendly)  
✅ Chỉ chạy được trên Vercel   

---

## �💾 Yêu cầu hệ thống

- Node.js >= 16.x
- npm hoặc yarn
- Tài khoản Google (để tạo OAuth2 Client)
- Đã bật Google Drive API (xem hướng dẫn bên dưới)

---

## Setup Local

### 1. Cài đặt 
```bash
git clone https://github.com/bquang2k6/mini-upload.git
```
```bash
cd thư mục gì đó
```
```bash
npm install
```

### 2. Tạo file `.env`
Copy từ `.env.example`:
```bash
cp .env.example .env
```




# Deploy trên Vercel

### Bước 1: Chuẩn bị Google Drive API credentials
#### Lấy Google Drive API credentials:

**Bước 1: Tạo OAuth Client ID trên Google Cloud**  
- Truy cập [Google Cloud Console](https://console.cloud.google.com/)
- Tạo project mới (hoặc chọn project bạn muốn dùng)
- Vào **APIs & Services > Credentials**
- Nhấn **Create Credentials > OAuth client ID**
- Application type: chọn **Web application**
- Authorized redirect URIs: thêm dòng:
  ```
  https://developers.google.com/oauthplayground
  ```
- Nhấn **Create** và copy **Client ID** và **Client Secret**

**Bước 2: Bật Google Drive API**  
- Vào **APIs & Services > Library**
- Tìm **Google Drive API** > **Enable**

**Bước 3: Lấy Refresh Token**  
- Vào [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
- Nhấn biểu tượng bánh răng (cài đặt) → chọn **Use your own OAuth credentials**
- Nhập **Client ID** và **Client Secret**
- Ở Step 1, tìm **Drive API v3** > tick:
  ```
  https://www.googleapis.com/auth/drive
  ```
- Nhấn **Authorize APIs**, đăng nhập Google, cấp quyền, quay lại playground
- Nhấn **Exchange authorization code for tokens**
- Copy **Refresh token** và điền vào `server.js`

---

### Bước 2: Deploy với Vercel
```bash
npm install -g vercel
vercel
```

Chọn "Y" khi hỏi import settings từ vercel.json

### Bước 3: Set Environment Variables trên Vercel Dashboard

1. Vào project trên Vercel: https://vercel.com/dashboard
2. Chọn project của bạn
3. Vào **Settings > Environment Variables**
4. Thêm 4 biến:
   ```
   YOUR_CLIENT_ID = <your_client_id>
   YOUR_CLIENT_SECRET = <your_client_secret>
   YOUR_REDIRECT_URI = https://developers.google.com/oauthplayground
   YOUR_REFRESH_TOKEN = <your_refresh_token>
   ```

### Bước 4: Redeploy (ko biết deloy thì nhờ chatgpt )
```bash
vercel --prod
```

✅ Dự án sẽ chạy tại: **https://your-project-name.vercel.app**


---

## 📁 Cấu trúc Project

```
.
├── public/
│   └── index.html              # Frontend (HTML + CSS + JS)
├── server.js                   # Express server + API routes
├── index.js                    # Entry point cho local
├── package.json                # Dependencies
├── vercel.json                 # Cấu hình Vercel
├── .env.example                # Template .env
├── .vercelignore               # Files bỏ qua khi deploy
└── README.md                   # File này
```






## 📢 Lưu ý bảo mật

- **Không chia sẻ mã nguồn chứa CLIENT_SECRET, REFRESH_TOKEN công khai!**
- Nếu bị lộ, phải đổi lại trên Google Cloud.

---

## ❤️ Đóng góp

- Pull request và các ý tưởng cải tiến luôn được chào đón!

---

## ☕ Nếu bạn thấy dự án này hữu ích, một ly cà phê từ bạn sẽ là động lực tuyệt vời để mình tiếp tục phát triển thêm!

<p align="center">
  <img src="https://locket.wangtech.top/banking_infor.png" alt="Mời cà phê" width="240" />
</p>

<h3 align="left">Một số dự án của tôi:</h3>
<p align="left">
<a href="https://locket.wangtech.top" target="_blank" style="text-decoration: none; text-align: center; display: inline-block;">
  <img src="https://locket.wangtech.top/icons8-heart-100.png" alt="phamquang2k6" height="30" width="30" />
  <br>
  <span style="color: inherit; font-size: 14px;">Locket Wan</span>
</a>

<a href="https://locket-tdtu.wangtech.top" target="_blank" style="text-decoration: none; text-align: center; display: inline-block; margin-left: 30px">
  <img src="https://locket.wangtech.top/icons8-heart-100.png" alt="phamquang2k6" height="30" width="30" />
  <br>
  <span style="color: inherit; font-size: 14px;">Locket TDTU</span>
</a>
