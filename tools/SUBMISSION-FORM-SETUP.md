# Setting up the submission form (about 10 minutes, one time)

The form on the website sends each submission to a small Google Apps Script that runs in your Google account. The script saves the file to Google Drive, logs it in a Google Sheet, emails the committee (vaselbehagh@usf.edu, dting@uwindsor.ca and TELab@uwindsor.ca) with the file attached, and sends the author a confirmation. It's free.

1. Sign in to the Google account that should own the submissions, then open https://script.google.com and click **New project**.
2. Delete the sample code. Paste in everything from `tools/submission-form.gs`, then click **Save**. You can name the project "CEA submissions".
3. In the function menu at the top, choose `authorize` and click **Run**. Approve the permissions Google asks for. If you see "Google hasn't verified this app", click **Advanced**, then **Go to CEA submissions**.
4. Click **Deploy**, then **New deployment**. Click the gear icon, choose **Web app**, and set:
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Click **Deploy** and copy the **Web app URL**. It ends in `/exec`.
6. In `index.html`, find `var FORM_ENDPOINT="";` and paste the URL between the quotes. Commit the change.

To change who receives submissions, edit the `COMMITTEE` list at the top of the script, then use **Deploy**, then **Manage deployments**, then edit the deployment and choose **New version**.

Limits: a free Google account can send email to about 100 recipients a day. Each submission uses 4 (three committee members plus the author), so about 25 submissions a day. A Google Workspace account allows much more.
