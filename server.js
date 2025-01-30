const express = require( 'express' );
const app = express();
const port = 3000;
const QRCode = require( 'qrcode' );
const bodyParser = require( 'body-parser' );

// Middleware to parse form data
app.use( bodyParser.urlencoded( { extended: true } ) );

// Temporary storage for the fake link and original link
let linkMap = {};

// التوجيه من الرابط الرئيسي إلى صفحة generate-qr
app.get( '/', ( req, res ) => {
    res.redirect( '/generate-qr' );
} );

// صفحة الـ Form لإدخال الروابط
app.get( '/generate-qr', ( req, res ) => {
    res.send( `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: #f4f4f4;
                }
                form {
                    background-color: white;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
                    width: 100%;
                    max-width: 400px;
                }
                label {
                    font-size: 14px;
                    margin-bottom: 5px;
                }
                input {
                    width: 100%;
                    padding: 8px;
                    margin-bottom: 15px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }
                button {
                    background-color: #007bff;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    width: 100%;
                }
                button:hover {
                    background-color: #0056b3;
                }
                img {
                    max-width: 100%;
                    height: auto;
                }
                @media (max-width: 768px) {
                    body {
                        padding: 10px;
                    }
                }
            </style>
        </head>
        <body>
            <form action="/generate-qr" method="POST">
                <h2>Create QR Code</h2>
                <label for="fakeLink">Enter Fake Link (can be any link):</label>
                <input type="text" id="fakeLink" name="fakeLink" required /><br><br>
                
                <label for="originalLink">Enter Original Link:</label>
                <input type="text" id="originalLink" name="originalLink" required /><br><br>
                
                <button type="submit">Generate QR Code</button>
            </form>
        </body>
        </html>
    `);
} );

// توليد QR Code بناءً على الروابط المدخلة
app.post( '/generate-qr', ( req, res ) => {
    let { fakeLink, originalLink } = req.body;

    // التأكد من إضافة البروتوكول (http:// أو https://) إذا لم يكن موجودًا
    if ( !/^https?:\/\//i.test( originalLink ) )
    {
        originalLink = 'http://' + originalLink;  // إضافة بروتوكول http إذا لم يكن موجود
    }

    // تخزين الروابط المدخلة في الذاكرة
    linkMap[ fakeLink ] = originalLink;

    const baseUrl = 'https://your-app-name.vercel.app'; // استبدل هذا برابط Vercel بعد النشر
    const fullLink = `${ baseUrl }/${ fakeLink }`;



    // توليد QR Code للرابط المزيف مباشرة
    QRCode.toDataURL( fullLink, ( err, url ) => {
        if ( err )
        {
            res.status( 500 ).send( 'Error generating QR code' );
        } else
        {
            res.send( `
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            flex-direction: column;
                            height: 100vh;
                            background-color: #f4f4f4;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                            margin-bottom: 20px;
                        }
                        a {
                            text-decoration: none;
                            background-color: #007bff;
                            color: white;
                            padding: 10px 20px;
                            border-radius: 5px;
                            margin-top: 20px;
                        }
                        a:hover {
                            background-color: #0056b3;
                        }
                    </style>
                </head>
                <body>
                    <h2>QR Code for Fake Link: ${ fakeLink }</h2>
                    <img src="${ url }" alt="QR Code" /><br><br>
                    <a href="/">Go back</a><br><br>
                    <!-- هنا نعرض الرابط المزيف كـ clickable link -->
                    <a href="/${ fakeLink }" target="_blank">Click here to visit the original link (will redirect to the original link)</a>
                </body>
                </html>
            `);
        }
    } );
} );

// التوجيه من الرابط المزيف إلى الرابط الأصلي
app.get( '/:fakeLink', ( req, res ) => {
    const fakeLink = req.params.fakeLink;

    // التأكد من الرابط المزيف
    if ( linkMap[ fakeLink ] )
    {
        const originalLink = linkMap[ fakeLink ];

        // إعادة التوجيه إلى الرابط الأصلي مباشرة عند النقر على الرابط المزيف
        res.redirect( originalLink );
    } else
    {
        res.status( 404 ).send( 'Not Found' );
    }
} );

// تشغيل السيرفر
app.listen( port, () => {
    console.log( `Server running at http://localhost:${ port }` );
} );
