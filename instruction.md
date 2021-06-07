# Installation Instruction

First install virtual environment using command: "pip install virtualenv".</br>
Then set up a new virtual environment using command: "virtualenv (environment name)".</br>
Then activate your environment using command: 
* For macOS:</br>`source <environment name>/bin/activate`
* For Windows:</br>`<environment name>/Scripts/activate`
<a/>
Then install all required packages using command: "pip install -r requirements.txt".</br>
Then go to setup.py file and change the variables based on your system.</br>
Go to the front of script.js file to change the baseURL of your system (If you're not running on localhost:5000).</br>
Run python databaseStart.py in the terminal to initialize your database.</br>
Then type flask run in the terminal to activate the program.</br>
Goto localhost:5000 in the browser to see the website.</br>
