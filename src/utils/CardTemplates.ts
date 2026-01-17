export const CardTemplates = {
    standard: (data: any) => `
        <html>
        <head>
            <style>
                body { margin: 0; font-family: Helvetica, sans-serif; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }
                .card { width: 350px; height: 200px; border: 1px solid #ddd; padding: 20px; display: flex; position: relative; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .card-back { background: #333; color: white; justify-content: center; align-items: center; flex-direction: column; }
                .logo { width: 50px; height: 50px; border-radius: 50%; background: #eee; margin-right: 15px; }
                .info { flex: 1; }
                .name { font-size: 18px; font-weight: bold; color: #333; }
                .role { font-size: 12px; color: #666; margin-bottom: 10px; text-transform: uppercase; }
                .contact { font-size: 10px; color: #555; line-height: 1.4; }
                .qr-container { display: flex; justify-content: center; align-items: center; margin-top: 20px; background: white; padding: 10px; border-radius: 8px; }
                .tagline { position: absolute; bottom: 20px; left: 20px; font-size: 9px; color: #aaa; font-style: italic; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <img src="${data.logo}" class="logo" />
                    <div class="info">
                        <div class="name">${data.name}</div>
                        <div class="role">${data.role}</div>
                        <div class="contact">
                            ${data.phone}<br/>
                            ${data.email}<br/>
                            ${data.address || ''}
                        </div>
                    </div>
                    <div class="tagline">Powered by Raabtaa</div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div class="qr-container">
                        ${data.qrCode}
                    </div>
                    <div style="margin-top: 10px; font-size: 12px;">Scan to Connect</div>
                </div>
            </div>
        </body>
        </html>
    `,
    broker: (data: any) => `
        <html>
        <head>
            <style>
                body { margin: 0; font-family: 'Courier New', monospace; background: #f0f0f0; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }
                .card { width: 350px; height: 200px; padding: 20px; position: relative; background: #1a1a1a; color: #00ff00; border: 2px solid #00ff00; overflow: hidden; }
                .stairs { position: absolute; bottom: 0; right: 0; width: 150px; height: 100px; opacity: 0.2; }
                .stair { background: #00ff00; height: 20px; width: 100%; margin-bottom: 5px; }
                .name { font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #00ff00; padding-bottom: 5px; display: inline-block; }
                .role { font-size: 12px; margin-top: 5px; color: #fff; }
                .contact { font-size: 10px; margin-top: 20px; color: #ccc; }
                .buy-sell { position: absolute; top: 20px; right: 20px; font-size: 14px; font-weight: bold; border: 1px solid #00ff00; padding: 5px 10px; border-radius: 4px; }
                .card-back { background: #000; display: flex; justify-content: center; align-items: center; flex-direction: column; border: 2px solid #00ff00; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="buy-sell">BUY / SELL</div>
                    <div class="name">${data.name}</div>
                    <div class="role">${data.role}</div>
                    <div class="contact">
                        📞 ${data.phone}<br/>
                        📧 ${data.email}
                    </div>
                    <div class="stairs">
                        <div style="width: 20%; height: 20%; background: #00ff00; position: absolute; bottom: 0; right: 80%;"></div>
                        <div style="width: 20%; height: 40%; background: #00ff00; position: absolute; bottom: 0; right: 60%;"></div>
                        <div style="width: 20%; height: 60%; background: #00ff00; position: absolute; bottom: 0; right: 40%;"></div>
                        <div style="width: 20%; height: 80%; background: #00ff00; position: absolute; bottom: 0; right: 20%;"></div>
                        <div style="width: 20%; height: 100%; background: #00ff00; position: absolute; bottom: 0; right: 0;"></div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div style="background: white; padding: 10px;">${data.qrCode}</div>
                    <div style="margin-top: 15px; color: #00ff00;">INVEST IN CONNECTIONS</div>
                </div>
            </div>
        </body>
        </html>
    `,
    bakery: (data: any) => `
        <html>
        <head>
            <style>
                body { margin: 0; font-family: Georgia, serif; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }
                .card { width: 350px; height: 200px; padding: 25px; position: relative; background: #fff5e6; border-radius: 15px; border: 4px dashed #d2691e; }
                .name { font-size: 22px; color: #8b4513; font-weight: bold; }
                .role { font-size: 14px; color: #cd853f; font-style: italic; margin-bottom: 15px; }
                .contact { font-size: 11px; color: #8b4513; }
                .biscuit-icon { position: absolute; bottom: 20px; right: 20px; font-size: 40px; }
                .card-back { background: #8b4513; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; }
                .qr-box { background: white; padding: 10px; border-radius: 10px; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="name">${data.name}</div>
                    <div class="role">${data.role}</div>
                    <div class="contact">
                        ${data.phone}<br/>
                        ${data.email}<br/>
                        ${data.address || 'Freshly Baked Connections'}
                    </div>
                    <div class="biscuit-icon">🍪</div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div class="qr-box">${data.qrCode}</div>
                    <div style="margin-top: 10px;">Scan for Freshness</div>
                </div>
            </div>
        </body>
        </html>
    `,
    dentist: (data: any) => `
        <html>
        <head>
            <style>
                body { margin: 0; font-family: Arial, sans-serif; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }
                .card { width: 350px; height: 200px; padding: 20px; position: relative; background: #e0f7fa; border-bottom: 5px solid #00acc1; }
                .tooth-bg { position: absolute; top: -20px; right: -20px; font-size: 100px; opacity: 0.1; color: #00acc1; }
                .name { font-size: 20px; color: #006064; font-weight: bold; }
                .role { font-size: 13px; color: #0097a7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
                .contact { font-size: 11px; color: #006064; }
                .card-back { background: #00acc1; display: flex; flex-direction: column; justify-content: center; align-items: center; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="tooth-bg">🦷</div>
                    <div class="name">${data.name}</div>
                    <div class="role">${data.role}</div>
                    <div class="contact">
                        ${data.phone}<br/>
                        ${data.email}<br/>
                        ${data.address || 'Smile with Confidence'}
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div style="background: white; padding: 8px; border-radius: 4px;">${data.qrCode}</div>
                    <div style="color: white; margin-top: 10px; font-size: 12px;">Book Your Appointment</div>
                </div>
            </div>
        </body>
        </html>
    `
};
