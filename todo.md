[] - Make the hourly work from the daily reports downloadable as a PDF.

[x] - Change the date format to dd/mm/yyyy in leave management and task management.
[] - Show the total number of leaves in the leave management section for employees as well.
In the per-employee section of the admin panel, show their entire performance history, phone, name, email, address, Aadhar card, salary, leave, bonus, total number of leaves, PAN number, total attendance, and the total number of check-ins and check-outs.

[] - In salary and payroll, only the admin can generate the salary slip for the month. Employees can only download their slip (PDF) for that month.

[] - (This entire process must be approved by the admin in the end; only then will the backend allow the employee to download the salary slip.)
If employees want to download an old salary slip, add a date picker and search the backend for that salary slip date. If it exists, allow the employee to download the PDF.

[] - In the hourly work log, next to "what did you work on" (on the right side), add a small dropdown for the status of the current task. 
Create status options: Done, Not Yet Started, Pending, In Progress.

[] - For the admin panel, create a month-wise employee calendar log that displays their entire history. 
If the user completed their tasks for the day, the date background should be green. If some are done and some are pending, make it yellow. If most are not done (e.g. >70% incomplete), make it red.

[] - For employees only, when they click on attendance, provide a "check-in" button that stores the first check-in time (making it immutable for the entire day).
After the user checks in, provide a "check-out" button that stores the check-out time (also immutable for the entire day).

[] - Provide a global search button for admins only. The admin should be able to search by employee name, email, phone, or salary, matching any employee that has this data in any field.

[] - On every login, fetch the employee's IP address and update it in the database.

[] - In the employee list on the admin panel, if they have a profile image, display the image next to their name. Otherwise, show the first letter of their name.

[] - Allow employees to replace their profile images.
