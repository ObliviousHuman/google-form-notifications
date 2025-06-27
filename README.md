# google-form-notifications

This script is designed to send an email notification when a Google Form is submitted.
It retrieves the form responses, formats them into an HTML table, and sends an email to the specified recipients.
The script also includes a mode switch (TEST/PROD) to control the email subject and recipients.
The email includes a link to the form responses summary and the linked Google Sheet (if available).
The script is designed to be used as a library, so you can import it into your own Google Apps Script project.
Note: This script assumes that the form has a linked Google Sheet for responses.
If the form does not have a linked sheet, it will notify you in the email.

To use this script, you need to set up a trigger in Google Apps Script:

1. Open your Google Form.
2. Click on the three dots in the top right corner and select "Script editor".
3. Copy and paste this script into the script editor.
4. Save the script with a name like "Form Mailer Notifications".
5. Set up a trigger by clicking on the clock icon in the toolbar.
6. Choose "From form" as the event source and "On form submit" as the event type.
7. Save the trigger.

This script will now run every time a form is submitted, sending an email notification with the submitted responses.
You can customize the email subject, recipients, and other settings by modifying the constants at the top of the script.
Note: This script is designed to be used as a library, so you can import it into your own Google Apps Script project.
To use this script as a library, you can follow these steps:

1. Open your Google Apps Script project.
2. Click on "Libraries" in the left sidebar.
3. Click on "Add a library" and enter the script ID of this library.
4. Click on "Add" to add the library to your project.
5. Once the library is added, you can use the `onFormSubmit` function in your own form scripts.

Example usage:

```javascript
   function runLibrary(e) {
     const formId = FormApp.getActiveForm().getId();
     FormMailerNotifications.onFormSubmit(e, formId);  // replace with your library
   }
```

To run this script, you need to create a function that calls the `onFormSubmit` function with the event object `e` and the form ID.
