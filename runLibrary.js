function runLibrary(e) {
    const formId = FormApp.getActiveForm().getId();
    FormMailerNotifications.onFormSubmit(e, formId);  // replace with your library
}