import qrcode

website_url = "https://roquemiguelito98-blip.github.io/DOT-Tourist-Arrivals-Apps/"

qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4,
)

qr.add_data(website_url)
qr.make(fit=True)

img = qr.make_image(fill_color="#8a38f5", back_color="white")

img.save("LGU_Monitoring_QR.png")

print("✅ Tapos na! Hanapin mo yung file na 'LGU_Monitoring_QR.png' sa folder mo.")