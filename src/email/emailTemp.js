export function emailTemplate(name,email,message) {
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
      <style>
     .header .logo {
      //   filter: invert(1) brightness(10000%) !important;
          object-fit: cover;
  
        background-color: transparent;
      }
      .table{
      display:flex;
      align-items="center"
         justify-content: space-between;
      }
      </style>
  
      </head>
        <body style="padding: 0; max-width: 600px; background-color: white; font-family: 'Arial', sans-serif; margin: 0 auto;">
          <!-- header -->
          <table role="presentation" width="100%" cellpadding="0" class="header" cellspacing="0" style="background-color: #2196f3; padding: 5px; color: white;">
            <tr>
              <td align="center">
                <img
                  src="https://tchatpro.com/email/logo2.png"
                  alt="logo"
                  width="150"
                  height="50"
                  class="logo"
                  style="display: block; margin: 0 auto;       object-fit: cover;
   "
                />
              </td>
            </tr>
          </table>
      
          <!-- main content -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 20px; ">
            <tr  class="table">
              <td>
                <img src="https://tchatpro.com/email/onboard1.png" alt="image" width="300" style="display: block;" />
              </td>
        
              <td style="padding-top: 20px; text-align: left;">
                <h1 style="color: black; font-size: 24px; margin: 0;">Help Center</h1>
                <p style="color: #707070; font-size: 18px; margin: 10px 0; line-height: 1.5;">
                  ${message}
                </p>
                <p style="margin: 0; font-size: 16px; line-height: 1.2;">
                  <strong>UserName:</strong> ${name}
                </p>
                <p style="font-size: 16px; margin: 3px 0; line-height: 1.2;">
                  <strong>Email:</strong> ${email}
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>`;
  }
  