/**
 * Triggered when a Google Form is submitted.
 * Sends an email notification with the submitted responses in an HTML table format.
 * @author Jason Coy, NTSH.co © 2025
 * @file form-mailer-notifications.gs (Library Script)
 * @type Google Apps Script
 * @reference https://developers.google.com/apps-script/
 * @description This script is designed to be used with Google Forms to send an email notification. Companion script "fmn-runLibrary.gs"
 * @version 1.0
 * 
 */

/**
 * This script is designed to send an email notification when a Google Form is submitted.
 * It retrieves the form responses, formats them into an HTML table, and sends an email to the specified recipients.
 * The script also includes a mode switch (TEST/PROD) to control the email subject and recipients.
 * The email includes a link to the form responses summary and the linked Google Sheet (if available).
 * The script is designed to be used as a library, so you can import it into your own Google Apps Script project.
 * Note: This script assumes that the form has a linked Google Sheet for responses.
 * If the form does not have a linked sheet, it will notify you in the email.
 * 
 * To use this script, you need to set up a trigger in Google Apps Script:
 * 1. Open your Google Form.
 * 2. Click on the three dots in the top right corner and select "Script editor".
 * 3. Copy and paste this script into the script editor.
 * 4. Save the script with a name like "Form Mailer Notifications".
 * 5. Set up a trigger by clicking on the clock icon in the toolbar.
 * 6. Choose "From form" as the event source and "On form submit" as the event type.
 * 7. Save the trigger.
 * 
 * This script will now run every time a form is submitted, sending an email notification with the submitted responses.
 * You can customize the email subject, recipients, and other settings by modifying the constants at the top of the script.
 * Note: This script is designed to be used as a library, so you can import it into your own Google Apps Script project.
 * To use this script as a library, you can follow these steps:
 * 1. Open your Google Apps Script project.
 * 2. Click on "Libraries" in the left sidebar.
 * 3. Click on "Add a library" and enter the script ID of this library.
 * 4. Click on "Add" to add the library to your project.
 * 5. Once the library is added, you can use the `onFormSubmit` function in your own form scripts.
 * Example usage:
 * ```javascript
 *    function runLibrary(e) {
 *      const formId = FormApp.getActiveForm().getId();
 *      FormMailerNotifications.onFormSubmit(e, formId);  // replace with your library
 *    }
 * ```
 * To run this script, you need to create a function that calls the `onFormSubmit` function with the event object `e` and the form ID.
 */
// set constants for all functions here-in
const mode = "TEST"; // "TEST" | "PROD" (others?)
const sender = "form-sender@address.tld";
const name = "Form Mailer Notifications"; // this is what is displayed as the Email Sender Name (from... e.g. "Form Mailer Notifications" <form-mailer-notifications@emerge2.com>)
const testers = ["form-tester@address.tld,..."];
const toAddress = ["form-recipient@address.tld,..."];
const baseForm = "https://docs.google.com/forms/d/";
const baseSheets = "https://docs.google.com/spreadsheets/d/";

// this function works on form submit, trigger must be handed 
function onFormSubmit(e, formId) {
  const form = FormApp.openById(formId);
  const formid = form.getId();
  const formTitle = form.getTitle();
  const response = e.response;  // <- Only the most recent response
  const timestamp = (response.getTimestamp?.() || new Date()).toISOString();
  const destinationId = form.getDestinationId();
  const formSummaryUrl = baseForm + formid + "/edit#responses";
  const sheetUrl = destinationId ? baseSheets + destinationId + "/edit" : null;
  const itemResponses = response.getItemResponses();
  let submittedBy;
  try {
    submittedBy = Session.getEffectiveUser().getEmail();
  } catch (err) {
    submittedBy = "Unavailable";
  }

  // Prepare the email content
  let recipients;
  let subject;

  // Set Title and Recipients based on current Mode
  if (mode === "TEST") {
    subject = "[TESTING] New response submitted: " + formTitle;
    recipients = testers.join(",");
  } else if (mode === "PROD") {
    subject = "New response submitted: " + formTitle;
    recipients = toAddress.join(",");
  }

  // set up the htmlBody
  let html = '<h2>New response submitted for "' + formTitle + '"</h2>';
  html += '<p><strong>Mode:</strong> ' + mode + '</p>';
  html += '<p><strong>Submitted at:</strong> ' + new Date().toLocaleString() + '</p>';

  // Create a table to display the form responses
  html += '<table border="1" style="border-collapse: collapse; width: 100%;">';
  html += '<tr><th>Question</th><th>Response</th></tr>';

  for (const itemResponse of itemResponses) {
    html += '<tr>';
    html += '<td style="padding: 8px; font-weight: bold;">' + itemResponse.getItem().getTitle() + '</td>';
    html += '<td style="padding: 8px;">' + itemResponse.getResponse() + '</td>';
    html += '</tr>';
  }

  html += '</table>';
  // Add a link to view the summary of the form responses
  html += '<p><em><a href="' + formSummaryUrl + '" target="_blank">View Summary</a></em></p>';

  // if we can't find a sheet url return error message.
  if (sheetUrl) {
    html += '<p><em><a href="' + sheetUrl + '" target="_blank">View Google Sheet</a></em></p>';
  } else {
    html += '<p style="color:red; font-size:150%; font-weight:bold;">No linked Google Sheet found for this form.</p>';
  }

  // Add a footer with the sender's email
  html += '<p style="font-size: 0.8em; color: gray;">This email was sent by <strong>' + sender + '</strong>.</p>';
  // sending the email to recipients
  GmailApp.sendEmail(
    recipients,
    subject,
    '',  // plain text body (required field, but can be empty)
    {
      htmlBody: html,
      // The 'from' field must be a verified alias for the account running this script.
      // If not, GmailApp.sendEmail will throw an error.
      from: sender,
      name: name
    }
  );

  // Log the payload for debugging purposes
  const logPayload = {
    mode: mode,
    subject: subject,
    formId: formid,
    formTitle: formTitle,
    formSummaryUrl: formSummaryUrl,
    sheetUrl: sheetUrl || 'Not linked',
    recipients: recipients,
    timestamp: timestamp,
    submittedBy: submittedBy,
    htmlPreview: html.slice(0, 200) + '...' // avoid logging huge blob
  }
  Logger.log(JSON.stringify(logPayload, null, 2));
}