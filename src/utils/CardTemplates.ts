export const CardTemplates = {
    standard: (data: any) => `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@300;400&display=swap');
                body { margin: 0; font-family: 'Lato', sans-serif; background: #f9f9f9; -webkit-print-color-adjust: exact; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .card {
                    width: 350px; height: 200px; padding: 30px;
                    background: #ffffff;
                    /* Subtle paper texture */
                    background-image: linear-gradient(to right, rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.02) 1px, transparent 1px);
                    background-size: 20px 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    border-radius: 4px;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    border: 1px solid #eee;
                }

                /* Artistic Splash */
                .splash {
                    position: absolute; top: -50%; right: -20%; width: 300px; height: 300px;
                    background: radial-gradient(circle, ${data.color || '#333'} 0%, transparent 70%);
                    opacity: 0.1; filter: blur(40px);
                }

                /* Left Border Accent */
                .accent-bar {
                    position: absolute; left: 0; top: 20px; bottom: 20px; width: 4px;
                    background: ${data.color || '#333'};
                    border-radius: 0 4px 4px 0;
                }

                .content { flex: 1; z-index: 2; display: flex; flex-direction: column; justify-content: center; padding-left: 20px; }

                .name {
                    font-family: 'Playfair Display', serif;
                    font-size: 28px;
                    color: #222;
                    margin-bottom: 5px;
                    letter-spacing: -0.5px;
                }

                .role {
                    font-size: 11px;
                    color: ${data.color || '#666'};
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 20px;
                    font-weight: 700;
                }

                .info-group { margin-top: auto; }
                .info-item {
                    font-size: 10px; color: #555; margin-bottom: 4px; display: flex; align-items: center;
                }
                .icon { width: 14px; text-align: center; margin-right: 8px; opacity: 0.6; }

                .logo-box {
                    position: absolute; top: 20px; right: 20px;
                    width: 50px; height: 50px;
                    border: 1px solid #eee;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    background: white;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                }
                .logo-img { width: 30px; height: 30px; object-fit: contain; }

                .card-back {
                    background: #222;
                    color: white;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    background-image: radial-gradient(circle at 50% 50%, #333 1px, transparent 1px);
                    background-size: 20px 20px;
                }

                .qr-frame {
                    padding: 10px;
                    background: white;
                    border: 1px solid #444;
                    box-shadow: 0 0 30px rgba(255,255,255,0.1);
                }

                .scan-cta { margin-top: 20px; font-family: 'Playfair Display', serif; font-size: 14px; letter-spacing: 1px; color: #ccc; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="accent-bar"></div>
                    <div class="splash"></div>
                    <div class="content">
                        <div class="name">${data.name}</div>
                        <div class="role">${data.role}</div>
                        <div class="info-group">
                            <div class="info-item"><span class="icon">📞</span> ${data.phone}</div>
                            <div class="info-item"><span class="icon">✉️</span> ${data.email}</div>
                            <div class="info-item"><span class="icon">📍</span> ${data.address || 'Global'}</div>
                        </div>
                    </div>
                    <div class="logo-box">
                        <img src="${data.logo || 'https://via.placeholder.com/50'}" class="logo-img" />
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div class="qr-frame">
                        ${data.qrCode}
                    </div>
                    <div class="scan-cta">Connect With Me</div>
                </div>
            </div>
        </body>
        </html>
    `,
    bakery: (data: any) => `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Josefin+Sans:wght@400;600&display=swap');
                body { margin: 0; font-family: 'Josefin Sans', sans-serif; background: #fff8f0; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                /* Kraft Paper Texture */
                .card {
                    width: 350px; height: 200px;
                    background-color: #e3cbae;
                    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E");
                    position: relative;
                    box-shadow: 0 10px 20px rgba(139, 69, 19, 0.2);
                    display: flex;
                    overflow: hidden;
                    /* Scalloped Edges via Clip Path - stylized as a biscuit/napkin */
                    /* clip-path: polygon(5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%, 0% 5%); */
                    border-radius: 10px;
                    border: 8px solid white; /* Icing border */
                }

                .texture-overlay {
                    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    background-image: radial-gradient(circle, rgba(255,255,255,0.8) 2px, transparent 2.5px);
                    background-size: 20px 20px;
                    opacity: 0.3;
                }

                .left-panel {
                    width: 60%; padding: 25px; z-index: 2;
                    display: flex; flex-direction: column; justify-content: center;
                }

                .right-panel {
                    width: 40%; background: rgba(255,255,255,0.3);
                    display: flex; align-items: center; justify-content: center;
                    border-left: 2px dashed rgba(139, 69, 19, 0.2);
                    position: relative;
                }

                .wheat-icon {
                    position: absolute; bottom: -10px; right: -10px; font-size: 80px; opacity: 0.1; color: #8b4513; transform: rotate(-20deg);
                }

                .name {
                    font-family: 'Dancing Script', cursive;
                    font-size: 32px;
                    color: ${data.color || '#8b4513'};
                    text-shadow: 1px 1px 0 rgba(255,255,255,0.5);
                    line-height: 1;
                    margin-bottom: 5px;
                }

                .role {
                    font-size: 12px; font-weight: 600; color: #a0522d; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;
                    background: white; display: inline-block; padding: 2px 8px; border-radius: 10px; width: fit-content;
                }

                .contact { font-size: 10px; color: #5d4037; line-height: 1.6; font-weight: 600; }

                /* Card Back - Chocolate Bar Look */
                .card-back {
                    background: #3e2723;
                    background-image: linear-gradient(45deg, #4e342e 25%, transparent 25%, transparent 75%, #4e342e 75%, #4e342e), linear-gradient(45deg, #4e342e 25%, transparent 25%, transparent 75%, #4e342e 75%, #4e342e);
                    background-position: 0 0, 10px 10px;
                    background-size: 20px 20px;
                    color: white;
                    border: 4px solid #5d4037;
                }

                .qr-circle {
                    background: #fff8f0; padding: 15px; border-radius: 50%;
                    border: 4px dashed ${data.color || '#8b4513'};
                    box-shadow: 0 5px 15px rgba(0,0,0,0.5);
                }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="texture-overlay"></div>
                    <div class="left-panel">
                        <div class="name">${data.name}</div>
                        <div class="role">Freshly Baked • ${data.role}</div>
                        <div class="contact">
                            ${data.phone}<br/>
                            ${data.email}<br/>
                            ${data.address || 'Sweet Street, Baker Town'}
                        </div>
                    </div>
                    <div class="right-panel">
                        <div class="wheat-icon">🌾</div>
                        <div style="text-align: center; font-size: 10px; color: #8b4513; font-weight: bold; transform: rotate(5deg); background: white; padding: 5px; box-shadow: 2px 2px 5px rgba(0,0,0,0.1);">
                            100%<br/>ORGANIC
                        </div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div class="qr-circle">
                        ${data.qrCode}
                    </div>
                    <div style="margin-top: 15px; font-family: 'Dancing Script'; font-size: 20px; color: #d7ccc8;">Scan for the menu</div>
                </div>
            </div>
        </body>
        </html>
    `,
    mechanic_tool: (data: any) => `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Roboto+Condensed:wght@400;700&display=swap');
                body { margin: 0; font-family: 'Roboto Condensed', sans-serif; background: #333; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .card {
                    width: 350px; height: 200px;
                    /* Diamond Plate Texture Simulation using Gradients */
                    background-color: #444;
                    background-image:
                        linear-gradient(135deg, rgba(0,0,0,0.3) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.3) 75%, transparent 75%, transparent),
                        linear-gradient(225deg, rgba(0,0,0,0.3) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.3) 75%, transparent 75%, transparent);
                    background-size: 20px 20px;
                    border-radius: 8px;
                    border: 2px solid #777;
                    box-shadow: inset 0 0 30px rgba(0,0,0,0.8), 0 10px 20px rgba(0,0,0,0.5);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                }

                /* Grime/Grease Overlay */
                .grime {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: radial-gradient(circle at 80% 20%, rgba(0,0,0,0.6) 0%, transparent 40%);
                    z-index: 1;
                    pointer-events: none;
                }

                /* Caution Stripe on left */
                .caution-tape {
                    width: 30px; height: 100%;
                    background: repeating-linear-gradient(
                        45deg,
                        #f1c40f,
                        #f1c40f 10px,
                        #2c3e50 10px,
                        #2c3e50 20px
                    );
                    border-right: 2px solid #222;
                    z-index: 2;
                }

                .content { flex: 1; padding: 20px; z-index: 2; color: #ddd; text-shadow: 1px 1px 2px black; }

                .name {
                    font-family: 'Black Ops One', cursive;
                    font-size: 24px;
                    color: #fff;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border-bottom: 2px solid ${data.color || '#e74c3c'};
                    display: inline-block;
                    margin-bottom: 5px;
                    padding-bottom: 2px;
                }

                .role {
                    font-size: 14px; font-weight: bold; color: ${data.color || '#e74c3c'};
                    text-transform: uppercase; margin-bottom: 15px;
                }

                .specs {
                    background: rgba(0,0,0,0.6);
                    border: 1px solid #555;
                    padding: 8px;
                    font-family: monospace;
                    font-size: 10px;
                    color: #f1c40f;
                    border-radius: 4px;
                }

                .screw {
                    position: absolute; width: 12px; height: 12px;
                    background: linear-gradient(to bottom, #ccc, #666);
                    border-radius: 50%;
                    box-shadow: 1px 1px 3px rgba(0,0,0,0.8);
                    z-index: 3;
                    display: flex; justify-content: center; align-items: center;
                }
                .screw::after { content: '+'; color: #333; font-size: 12px; font-weight: bold; margin-top: -3px; }
                .tr { top: 10px; right: 10px; }
                .br { bottom: 10px; right: 10px; }

                .card-back {
                    background: #2c3e50;
                    border: 4px solid #f1c40f;
                    flex-direction: column; justify-content: center; align-items: center;
                }

                .scan-box {
                    background: white; padding: 5px; border: 2px dashed #333;
                }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="screw tr"></div><div class="screw br"></div>
                    <div class="grime"></div>
                    <div class="caution-tape"></div>
                    <div class="content">
                        <div class="name">${data.name}</div>
                        <div class="role">${data.role}</div>
                        <div class="specs">
                            > TEL: ${data.phone}<br/>
                            > MAIL: ${data.email}<br/>
                            > STATUS: OPERATIONAL
                        </div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div class="scan-box">
                        ${data.qrCode}
                    </div>
                    <div style="margin-top: 15px; color: #f1c40f; font-family: 'Black Ops One'; font-size: 18px; letter-spacing: 2px;">SCAN TO REPAIR</div>
                </div>
            </div>
        </body>
        </html>
    `,
    broker: (data: any) => `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Montserrat:wght@300;600&display=swap');
                body { margin: 0; font-family: 'Montserrat', sans-serif; background: #000; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .card {
                    width: 350px; height: 200px;
                    background: radial-gradient(circle at 100% 0%, #1a2a3a 0%, #000 70%);
                    color: white;
                    position: relative;
                    border: 1px solid #333;
                    border-radius: 6px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }

                /* Gold Accent Line */
                .gold-line {
                    position: absolute; top: 30px; left: 0; width: 100%; height: 1px;
                    background: linear-gradient(90deg, transparent, ${data.color || '#d4af37'}, transparent);
                }

                /* Ticker Tape Background */
                .ticker-bg {
                    position: absolute; bottom: 10px; width: 100%;
                    font-family: monospace; font-size: 10px; color: rgba(255,255,255,0.1);
                    white-space: nowrap; overflow: hidden;
                }

                .content { padding: 40px 30px; z-index: 2; position: relative; }

                .name {
                    font-family: 'Cinzel', serif;
                    font-size: 24px;
                    background: linear-gradient(to right, #fff, #999);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 5px;
                }

                .role {
                    font-size: 10px; letter-spacing: 3px; color: ${data.color || '#d4af37'}; text-transform: uppercase; margin-bottom: 25px;
                }

                .contact-grid {
                    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
                    font-size: 9px; color: #aaa;
                }
                .label { color: #555; font-size: 8px; text-transform: uppercase; }

                .card-back {
                    background: #050505;
                    border: 1px solid ${data.color || '#d4af37'};
                    display: flex; align-items: center; justify-content: center;
                }

                .logo-overlay {
                    position: absolute; opacity: 0.05; font-size: 100px;
                }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="gold-line"></div>
                    <div class="content">
                        <div class="name">${data.name}</div>
                        <div class="role">${data.role}</div>
                        <div class="contact-grid">
                            <div><div class="label">Mobile</div>${data.phone}</div>
                            <div><div class="label">Office</div>${data.email}</div>
                            <div style="grid-column: span 2;"><div class="label">Headquarters</div>${data.address || 'Wall St, NY'}</div>
                        </div>
                    </div>
                    <div class="ticker-bg">BTC +5.2%  ETH +2.1%  S&P500 +0.4%  NSDQ -0.1%  GOLD +1.2%</div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div class="logo-overlay">💎</div>
                    <div style="background: white; padding: 8px; border: 1px solid #d4af37;">${data.qrCode}</div>
                </div>
            </div>
        </body>
        </html>
    `,
    dentist: (data: any) => `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;700&display=swap');
                body { margin: 0; font-family: 'Nunito', sans-serif; background: #f0faff; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .card {
                    width: 350px; height: 200px;
                    background: linear-gradient(120deg, #ffffff 0%, #e0f7fa 100%);
                    border-radius: 20px;
                    box-shadow: 0 10px 25px rgba(0, 188, 212, 0.15);
                    position: relative; overflow: hidden;
                    display: flex; align-items: center;
                }

                /* Abstract Tooth/Water Shape */
                .blob {
                    position: absolute; right: -50px; bottom: -50px;
                    width: 200px; height: 200px;
                    background: linear-gradient(45deg, ${data.color || '#4dd0e1'}, #00bcd4);
                    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
                    opacity: 0.2;
                }
                .blob2 {
                    position: absolute; top: -30px; left: -30px;
                    width: 100px; height: 100px;
                    background: #b2ebf2;
                    border-radius: 50%;
                    opacity: 0.5;
                }

                .content { z-index: 2; padding: 30px; width: 100%; }

                .name { font-size: 26px; font-weight: 700; color: #006064; }
                .role { font-size: 12px; font-weight: 300; color: #00838f; letter-spacing: 1px; margin-bottom: 20px; text-transform: uppercase; }

                .info { font-size: 11px; color: #555; margin-bottom: 5px; display: flex; align-items: center; }
                .dot { width: 6px; height: 6px; background: ${data.color || '#26c6da'}; border-radius: 50%; margin-right: 8px; }

                .card-back {
                    background: ${data.color || '#00bcd4'};
                    color: white;
                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                }
                .smile-icon { font-size: 40px; margin-bottom: 10px; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="blob"></div>
                    <div class="blob2"></div>
                    <div class="content">
                        <div class="name">Dr. ${data.name}</div>
                        <div class="role">${data.role}</div>
                        <div class="info"><div class="dot"></div>${data.phone}</div>
                        <div class="info"><div class="dot"></div>${data.email}</div>
                        <div class="info"><div class="dot"></div>${data.address || 'Dental Clinic'}</div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div class="smile-icon">🦷</div>
                    <div style="background: white; padding: 10px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">${data.qrCode}</div>
                </div>
            </div>
        </body>
        </html>
    `,
    tech_terminal: (data: any) => `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;700&display=swap');
                body { margin: 0; font-family: 'Source Code Pro', monospace; background: #000; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .card {
                    width: 350px; height: 200px;
                    background-color: #0d0208;
                    /* Grid Line Effect */
                    background-image: linear-gradient(rgba(0, 255, 65, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 255, 65, 0.05) 1px, transparent 1px);
                    background-size: 20px 20px;
                    border: 1px solid #003b00;
                    border-radius: 6px;
                    box-shadow: 0 0 20px rgba(0, 255, 65, 0.2);
                    padding: 15px;
                    position: relative;
                    overflow: hidden;
                }

                /* CRT Scanline */
                .card::before {
                    content: " "; display: block; position: absolute; top: 0; left: 0; bottom: 0; right: 0;
                    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
                    z-index: 2; background-size: 100% 2px, 3px 100%; pointer-events: none;
                }

                .header-bar {
                    border-bottom: 1px solid #00ff41; padding-bottom: 5px; margin-bottom: 15px;
                    display: flex; justify-content: space-between; font-size: 8px; color: #008F11;
                }

                .prompt { color: #00ff41; text-shadow: 0 0 5px #00ff41; font-size: 12px; }
                .command { color: #fff; font-size: 12px; }

                .output-block { margin-top: 10px; margin-left: 10px; font-size: 10px; color: #ccc; }
                .key { color: ${data.color || '#00ff41'}; margin-right: 10px; }
                .string { color: #f1c40f; }

                .cursor { display: inline-block; width: 6px; height: 12px; background: #00ff41; animation: blink 1s infinite; }
                @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }

                .card-back { background: #000; border: 1px solid #00ff41; justify-content: center; align-items: center; display: flex; flex-direction: column; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="header-bar">
                        <span>ADMIN@SYSTEM</span>
                        <span>v1.0.4</span>
                    </div>
                    <div style="z-index: 3; position: relative;">
                        <div class="line">
                            <span class="prompt">root@junr:~#</span> <span class="command">whoami</span>
                        </div>
                        <div class="output-block">
                            <div style="font-size: 18px; font-weight: bold; color: #fff; margin: 5px 0;">${data.name}</div>
                            <div style="color: #008F11; margin-bottom: 10px;">${data.role}</div>

                            <div><span class="key">contact:</span> <span class="string">"${data.phone}"</span></div>
                            <div><span class="key">email:</span> <span class="string">"${data.email}"</span></div>
                        </div>
                        <div class="line" style="margin-top: 10px;">
                            <span class="prompt">root@junr:~#</span> <span class="cursor"></span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div style="border: 2px solid #00ff41; padding: 5px; box-shadow: 0 0 10px #00ff41;">
                        ${data.qrCode}
                    </div>
                    <div style="color: #00ff41; margin-top: 10px; font-size: 10px;">DOWNLOAD_DATA_PACKET...</div>
                </div>
            </div>
        </body>
        </html>
    `,
    split_card: (data: any) => `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Open+Sans:wght@400;600&display=swap');
                body { margin: 0; font-family: 'Open Sans', sans-serif; background: #ccc; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .card {
                    width: 350px; height: 200px;
                    display: flex;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                    border-radius: 8px; overflow: hidden;
                }

                .left-side {
                    flex: 1;
                    background: ${data.color || '#2c3e50'};
                    color: white;
                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                    padding: 20px; text-align: center;
                    position: relative;
                }
                .left-side::after {
                    content: ''; position: absolute; right: -10px; top: 50%; transform: translateY(-50%) rotate(45deg);
                    width: 20px; height: 20px; background: ${data.color || '#2c3e50'}; z-index: 10;
                }

                .right-side {
                    flex: 1.2;
                    background: #fdfdfd;
                    color: #333;
                    display: flex; flex-direction: column; justify-content: center;
                    padding: 20px 20px 20px 30px;
                }

                .big-initial {
                    font-family: 'Libre Baskerville', serif; font-size: 60px; font-weight: 700; color: rgba(255,255,255,0.2);
                    position: absolute; top: 10px; left: 10px;
                }

                .role-tag {
                    font-size: 10px; text-transform: uppercase; letter-spacing: 2px; border: 1px solid rgba(255,255,255,0.3);
                    padding: 5px 10px; border-radius: 20px; margin-bottom: 5px;
                }

                .name { font-family: 'Libre Baskerville', serif; font-size: 20px; color: #222; margin-bottom: 5px; }
                .contact-info { font-size: 10px; color: #666; margin-top: 15px; line-height: 1.8; }
                .contact-info span { display: block; border-bottom: 1px solid #eee; padding-bottom: 2px; margin-bottom: 2px; }

                .card-back { background: #333; color: white; display: flex; align-items: center; justify-content: center; flex-direction: column; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="left-side">
                        <div class="big-initial">${data.name.charAt(0)}</div>
                        <div class="role-tag">${data.role}</div>
                    </div>
                    <div class="right-side">
                        <div class="name">${data.name}</div>
                        <div class="contact-info">
                            <span>📱 ${data.phone}</span>
                            <span>📧 ${data.email}</span>
                            <span>📍 ${data.address || 'Office'}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div style="background: white; padding: 8px; border-radius: 4px;">${data.qrCode}</div>
                </div>
            </div>
        </body>
        </html>
    `,
    finger_play: (data: any) => `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;500;700&display=swap');
                body { margin: 0; font-family: 'Quicksand', sans-serif; background: #fff; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .card {
                    width: 350px; height: 200px;
                    background: linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%);
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(166, 193, 238, 0.5);
                    position: relative; overflow: hidden;
                    display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;
                    border: 4px solid white;
                }

                .lotus {
                    position: absolute; bottom: -30px; width: 200px; height: 200px;
                    background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
                    border-radius: 50%;
                }

                .content { z-index: 2; background: rgba(255,255,255,0.8); padding: 20px 40px; border-radius: 20px; backdrop-filter: blur(5px); }

                .name { font-size: 22px; font-weight: 700; color: #555; margin-bottom: 5px; }
                .role { font-size: 12px; color: ${data.color || '#888'}; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 15px; }
                .contact { font-size: 11px; color: #666; }

                .card-back { background: white; }
                .qr-bg { background: linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%); padding: 15px; border-radius: 20px; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="lotus"></div>
                    <div class="content">
                        <div class="name">${data.name}</div>
                        <div class="role">${data.role}</div>
                        <div class="contact">
                            ${data.phone} <br/> ${data.email}
                        </div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div class="qr-bg">${data.qrCode}</div>
                    <div style="margin-top: 15px; color: #888; font-size: 12px; letter-spacing: 1px;">PEACE • LOVE • CONNECT</div>
                </div>
            </div>
        </body>
        </html>
    `,
    chart_graph: (data: any) => `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;800&display=swap');
                body { margin: 0; font-family: 'Inter', sans-serif; background: #fff; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .card {
                    width: 350px; height: 200px;
                    background: #111;
                    color: white;
                    border-radius: 12px;
                    overflow: hidden;
                    position: relative;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.3);
                    display: flex; flex-direction: column; justify-content: space-between; padding: 25px;
                }

                /* Chart Background */
                .chart-line {
                    position: absolute; bottom: 0; left: 0; width: 100%; height: 60%;
                    background: linear-gradient(to top, ${data.color ? data.color + '66' : 'rgba(52, 152, 219, 0.4)'} 0%, transparent 100%);
                    clip-path: polygon(0 100%, 0 40%, 20% 60%, 40% 30%, 60% 50%, 80% 20%, 100% 10%, 100% 100%);
                    z-index: 1;
                }
                .chart-line-stroke {
                    position: absolute; bottom: 0; left: 0; width: 100%; height: 60%;
                    background: ${data.color || '#3498db'};
                    clip-path: polygon(0 40%, 20% 60%, 40% 30%, 60% 50%, 80% 20%, 100% 10%, 100% 12%, 80% 22%, 60% 52%, 40% 32%, 20% 62%, 0 42%);
                    z-index: 2;
                }

                .header { z-index: 3; }
                .name { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
                .role { font-size: 12px; opacity: 0.8; font-weight: 400; margin-top: 2px; }

                .stats-row { z-index: 3; display: flex; gap: 20px; margin-bottom: 10px; }
                .stat { display: flex; flex-direction: column; }
                .stat-val { font-size: 14px; font-weight: bold; color: ${data.color || '#3498db'}; }
                .stat-label { font-size: 8px; color: #888; text-transform: uppercase; }

                .card-back { background: #222; justify-content: center; align-items: center; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="chart-line"></div>
                    <div class="chart-line-stroke"></div>
                    <div class="header">
                        <div class="name">${data.name}</div>
                        <div class="role">${data.role}</div>
                    </div>
                    <div class="stats-row">
                        <div class="stat">
                            <span class="stat-val">${data.phone}</span>
                            <span class="stat-label">Direct Line</span>
                        </div>
                        <div class="stat">
                            <span class="stat-val">ROI +200%</span>
                            <span class="stat-label">Performance</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div style="background: white; padding: 10px; border-radius: 8px;">${data.qrCode}</div>
                    <div style="margin-top: 15px; font-weight: 800; font-size: 12px; color: #fff;">ANALYZE • OPTIMIZE • SCALE</div>
                </div>
            </div>
        </body>
        </html>
    `
};
