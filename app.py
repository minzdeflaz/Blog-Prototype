from flask import Flask, render_template, redirect, session
from flask_cors import CORS
from api import db, api
import setup

#Configuration
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = setup.URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.secret_key = setup.Secret

CORS(app)
db.init_app(app)
api.init_app(app)


#Default route
@app.route('/')
def index(): 
  return redirect('/login')

#Sign up page
@app.route('/signup')
def signup():
  return render_template('signup.html')
  
#Login page
@app.route('/login')
def login():
  return render_template('login.html')

#Home page
@app.route('/home')
def home():
  return render_template('home.html')

#Update user's info if not provided enough info
@app.route('/updateInfo')
def updateInfo():
  return render_template('updateInfo.html')

#Create new post page
@app.route('/createPost')
def createPost():
  return render_template('createPost.html')

#Personal Posts page
@app.route('/wall')
def feed():
  return render_template('wall.html')



#Post detailed page
@app.route('/postDetailed/<int:id>')
def post(id):
  return render_template('post.html')

#Like list
@app.route('/likeList/<int:postID>')
def likeList(postID):
  return render_template('likeList.html')


if __name__ == "__main__":
  app.run(debug=True)
