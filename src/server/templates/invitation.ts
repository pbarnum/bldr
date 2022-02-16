export default {
  html: `<html>
    <body>
        <h1>Hello {invitee}!</h1>
        <p>{invitor} has invited you to join Bldr!</p>
        <h3><a href="{verificationLink}">Click here to set up your account</a></h3>
    </body>
</html>`,

  text: `Hello {invitee}!
{invitor} has invited you to join Bldr! Please visit {verificationLink} to set up your account.`,
};
