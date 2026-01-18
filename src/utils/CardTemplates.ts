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
    `,
    tech_terminal: (data: any) => `
        <html>
        <head>
            <style>
                body { margin: 0; font-family: 'Courier New', monospace; background: #333; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }
                .card { width: 350px; height: 200px; background: #1e1e1e; border-radius: 10px; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.5); border: 1px solid #444; }
                .window-bar { background: #2d2d2d; padding: 10px; display: flex; align-items: center; border-bottom: 1px solid #333; }
                .dot { width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; }
                .red { background: #ff5f56; }
                .yellow { background: #ffbd2e; }
                .green { background: #27c93f; }
                .content { padding: 20px; color: #d4d4d4; font-size: 12px; line-height: 1.6; }
                .keyword { color: #569cd6; }
                .string { color: #ce9178; }
                .variable { color: #9cdcfe; }
                .comment { color: #6a9955; }
                .cursor { display: inline-block; width: 8px; height: 15px; background: #d4d4d4; animation: blink 1s infinite; vertical-align: middle; }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                .card-back { background: #1e1e1e; display: flex; justify-content: center; align-items: center; flex-direction: column; }
                .qr-bg { background: white; padding: 8px; border-radius: 4px; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="window-bar">
                        <div class="dot red"></div>
                        <div class="dot yellow"></div>
                        <div class="dot green"></div>
                    </div>
                    <div class="content">
                        <span class="keyword">const</span> <span class="variable">developer</span> = {<br/>
                        &nbsp;&nbsp;name: <span class="string">'${data.name}'</span>,<br/>
                        &nbsp;&nbsp;role: <span class="string">'${data.role}'</span>,<br/>
                        &nbsp;&nbsp;contact: {<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;phone: <span class="string">'${data.phone}'</span>,<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;email: <span class="string">'${data.email}'</span><br/>
                        &nbsp;&nbsp;}<br/>
                        };<br/>
                        <span class="comment">// Connect now</span><span class="cursor"></span>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                     <div class="window-bar">
                        <div class="dot red"></div>
                        <div class="dot yellow"></div>
                        <div class="dot green"></div>
                    </div>
                    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                        <div class="qr-bg">${data.qrCode}</div>
                        <div style="color: #9cdcfe; margin-top: 15px; font-family: 'Courier New';">&lt;ScanMe /&gt;</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `,
    mechanic_tool: (data: any) => `
        <html>
        <head>
            <style>
                body { margin: 0; font-family: Impact, sans-serif; background: #eee; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }
                /* Simulating a wrench shape using border-radius and gradients */
                .card-container { width: 350px; height: 200px; display: flex; align-items: center; justify-content: center; position: relative; }
                .cut-line { position: absolute; width: 340px; height: 120px; border: 2px dashed #999; border-radius: 60px 10px 10px 60px; z-index: 0; pointer-events: none; }
                .cut-text { position: absolute; top: 10px; right: 20px; font-size: 10px; color: #999; font-family: Arial, sans-serif; }

                .card { width: 330px; height: 110px; background: linear-gradient(135deg, #cfcfcf 0%, #f1f1f1 50%, #9e9e9e 100%); border-radius: 55px 5px 5px 55px; display: flex; align-items: center; padding: 10px 20px; box-shadow: 2px 2px 5px rgba(0,0,0,0.3); z-index: 1; position: relative; border: 1px solid #999; }

                /* The "Head" of the wrench hole */
                .wrench-hole { width: 50px; height: 50px; background: #eee; border-radius: 50%; position: absolute; left: 15px; top: 30px; border: 4px solid #888; box-shadow: inset 2px 2px 5px rgba(0,0,0,0.2); display: flex; justify-content: center; align-items: center; font-size: 8px; color: #aaa; text-align: center;}

                .info-area { margin-left: 60px; flex: 1; }
                .name { font-size: 24px; color: #333; letter-spacing: 1px; text-transform: uppercase; }
                .role { font-size: 12px; color: #e74c3c; text-transform: uppercase; margin-bottom: 5px; }
                .contact { font-size: 10px; color: #444; font-family: Arial, sans-serif; }

                .bolt { width: 10px; height: 10px; background: #bbb; border-radius: 50%; border: 1px solid #777; position: absolute; }
                .b1 { top: 10px; right: 10px; }
                .b2 { bottom: 10px; right: 10px; }
                .b3 { top: 10px; left: 70px; }

                .card-back { background: linear-gradient(135deg, #444 0%, #222 100%); color: white; justify-content: center; border-radius: 55px 5px 5px 55px; }
                .qr-container { padding: 5px; background: white; border-radius: 4px; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card-container">
                    <div class="cut-text">✂ Cut along dashed line</div>
                    <div class="cut-line"></div>
                    <div class="card">
                        <div class="wrench-hole">HEX<br/>SIZE</div>
                        <div class="bolt b1"></div>
                        <div class="bolt b2"></div>
                        <div class="bolt b3"></div>
                        <div class="info-area">
                            <div class="name">${data.name}</div>
                            <div class="role">${data.role}</div>
                            <div class="contact">
                                ${data.phone} • ${data.email}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card-container">
                    <div class="cut-line"></div>
                    <div class="card card-back">
                         <div class="wrench-hole" style="background: #333; border-color: #555;"></div>
                         <div style="display: flex; flex-direction: row; align-items: center; margin-left: 60px;">
                            <div class="qr-container">${data.qrCode}</div>
                            <div style="margin-left: 15px; font-size: 14px; color: #ccc;">FIX IT.<br/>SCAN IT.</div>
                         </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `,
    split_card: (data: any) => `
        <html>
        <head>
            <style>
                body { margin: 0; font-family: 'Times New Roman', serif; background: #fdfdfd; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .card { width: 350px; height: 200px; display: flex; position: relative; background: #fffcf5; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }

                .left-side { width: 50%; height: 100%; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
                .right-side { width: 50%; height: 100%; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }

                .divider { position: absolute; left: 50%; top: 0; bottom: 0; width: 0; border-left: 2px dashed #999; }
                .scissor-icon { position: absolute; left: 47%; top: -10px; font-size: 20px; background: #fffcf5; padding: 2px; color: #555; }
                .tear-text { position: absolute; left: 42%; bottom: 5px; font-size: 10px; color: #999; background: #fffcf5; font-family: Arial; }

                .name { font-size: 16px; font-weight: bold; color: #2c3e50; margin-bottom: 5px; }
                .role { font-size: 10px; color: #7f8c8d; text-transform: uppercase; margin-bottom: 10px; }
                .contact { font-size: 9px; color: #34495e; }

                .card-back { background: #2c3e50; }
                .back-half { width: 50%; height: 100%; display: flex; justify-content: center; align-items: center; border-right: 1px dashed #555; }
                .qr-box { background: white; padding: 5px; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="left-side">
                        <div class="name">${data.name}</div>
                        <div class="role">${data.role}</div>
                        <div class="contact">${data.phone}</div>
                    </div>
                    <div class="divider"></div>
                    <div class="scissor-icon">✂</div>
                    <div class="tear-text">TEAR HERE</div>
                    <div class="right-side">
                         <div class="name">${data.name}</div>
                         <div class="role">${data.role}</div>
                         <div class="contact">${data.email}</div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div class="back-half">
                        <div class="qr-box">${data.qrCode}</div>
                    </div>
                    <div class="back-half" style="border: none;">
                        <div class="qr-box">${data.qrCode}</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `,
    finger_play: (data: any) => `
        <html>
        <head>
            <style>
                body { margin: 0; font-family: Helvetica, sans-serif; background: #eef2f3; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .card { width: 350px; height: 200px; background: #fff; position: relative; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); overflow: hidden; }

                /* Finger Holes Guides */
                .holes-container { position: absolute; bottom: 0; left: 0; right: 0; height: 100px; display: flex; justify-content: center; align-items: flex-end; padding-bottom: 20px; }
                .finger-hole { width: 50px; height: 50px; border: 2px dashed #ccc; border-radius: 50%; margin: 0 10px; display: flex; justify-content: center; align-items: center; font-size: 10px; color: #ccc; background: #f9f9f9; }

                .graphic { position: absolute; bottom: 80px; left: 0; right: 0; text-align: center; font-size: 80px; line-height: 80px; opacity: 0.1; }

                .content-top { padding: 20px; text-align: center; z-index: 10; position: relative; }
                .name { font-size: 20px; font-weight: bold; color: #333; }
                .role { font-size: 14px; color: #e91e63; margin-top: 5px; }
                .contact { font-size: 11px; color: #666; margin-top: 10px; }

                .instruction { position: absolute; bottom: 5px; width: 100%; text-align: center; font-size: 9px; color: #999; }

                .card-back { background: #e91e63; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="graphic">🤸</div>
                    <div class="content-top">
                        <div class="name">${data.name}</div>
                        <div class="role">${data.role}</div>
                        <div class="contact">${data.phone} | ${data.email}</div>
                    </div>
                    <div class="holes-container">
                        <div class="finger-hole">CUT</div>
                        <div class="finger-hole">CUT</div>
                    </div>
                    <div class="instruction">Insert fingers to bring to life</div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div style="background: white; padding: 10px; border-radius: 8px;">${data.qrCode}</div>
                    <div style="margin-top: 15px; font-weight: bold;">LET'S GET MOVING</div>
                </div>
            </div>
        </body>
        </html>
    `,
    chart_graph: (data: any) => `
        <html>
        <head>
            <style>
                body { margin: 0; font-family: 'Arial Black', sans-serif; background: #f4f4f4; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .card-container { width: 350px; height: 200px; position: relative; display: flex; align-items: flex-end; }

                /* The jagged graph shape */
                .card { width: 100%; height: 160px; background: #2ecc71; position: relative; padding: 20px; box-sizing: border-box; color: white; clip-path: polygon(0% 100%, 0% 40%, 15% 60%, 30% 20%, 45% 50%, 60% 10%, 75% 40%, 90% 0%, 100% 20%, 100% 100%); display: flex; flex-direction: column; justify-content: flex-end; }

                /* Cut Guide Overlay */
                .cut-guide { position: absolute; bottom: 0; left: 0; width: 100%; height: 160px; border-top: 2px dashed #aaa; opacity: 0.5; pointer-events: none; clip-path: polygon(0% 100%, 0% 40%, 15% 60%, 30% 20%, 45% 50%, 60% 10%, 75% 40%, 90% 0%, 100% 20%, 100% 100%); background: none; border: none; }
                /* We simulate the dashed line by drawing a slightly larger white bg behind and masking? No, simple dashed border won't work on complex clip-path.
                   Instead, we add a "Cut along the top edge" text */

                .name { font-size: 24px; text-transform: uppercase; margin-bottom: 5px; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
                .role { font-size: 14px; opacity: 0.9; margin-bottom: 15px; font-family: Arial, sans-serif; }
                .contact { font-size: 10px; font-family: Arial, sans-serif; line-height: 1.4; opacity: 0.8; }

                .growth-text { position: absolute; top: -30px; right: 0; color: #2ecc71; font-size: 12px; font-weight: bold; }

                .card-back { background: #27ae60; height: 160px; justify-content: center; align-items: center; display: flex; }

                /* For preview consistency we need the full 200px height container */
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card-container">
                    <div class="growth-text">✂ CUT THE GRAPH</div>
                    <div class="card">
                        <div class="name">${data.name}</div>
                        <div class="role">${data.role}</div>
                        <div class="contact">
                            ${data.phone}<br/>
                            ${data.email}
                        </div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card-container">
                    <div class="card card-back">
                        <div style="background: white; padding: 10px; border-radius: 4px;">${data.qrCode}</div>
                        <div style="margin-top: 10px; font-size: 12px; font-family: Arial;">SCAN FOR GROWTH</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `
};
