from flask import Flask, render_template, request, redirect, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from validate_email import validate_email
import setup

#Configuration
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = setup.URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.secret_key = setup.Secret
db = SQLAlchemy(app)

#MySQL table Accounts
class Accounts(db.Model):
  __tablename__ = "accounts"
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String(50))
  userName = db.Column(db.String(100), unique=True, nullable=False)
  password = db.Column(db.String(100), nullable=False)
  email = db.Column(db.String(100), unique=True, nullable=False)
  phoneNumber = db.Column(db.String(12))
  occupation = db.Column(db.String(50))
  def hasNull(self):
    for _, value in self.__dict__.items():
      if value == None or value == "":
        return True
    return False
  def __repr__(self) :
      return f"Account(name={self.name}, userName={self.userName}, password={self.password}, email={self.email}, phonenumber={self.phoneNumber}, occupation={self.occupation})"
  
#MySQL table Posts 
class Posts(db.Model):
  __tablename__ = "posts"
  id = db.Column(db.Integer, primary_key=True)
  title = db.Column(db.String(50), nullable=False)
  content = db.Column(db.Text)
  likeStr = db.Column(db.String(150), nullable=False, default="No one liked this post yet")
  userName = db.Column(db.String(100), db.ForeignKey('accounts.userName'), nullable=False)
  accID = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)

#MySQL table Likes
class Likes(db.Model):
  __tablename__ = "likes"
  id = db.Column(db.Integer, primary_key=True)
  postID = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
  accID = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
  userName = db.Column(db.String(100), db.ForeignKey('accounts.userName'), nullable=False)


#Generate Like String for Posts
def generateLikeStr(likes, userName, detailed = False):
  likeList = ["You"]
  you = False
  for like in likes:
    if like.userName == userName:
      you = True
    else:
      likeList.append(like.userName)
  if you == False:
    likeList.pop(0)
  if detailed == False:
    if len(likeList) == 1:
      return likeList[0] + ' liked this post.'
    elif len(likeList) == 2:
      return likeList[0] + ', ' + likeList[1] + ' liked this post.'
    else:
      return likeList[0] + ', ' + likeList[1] + f', and {len(likeList) - 2} other people liked this post.'
  else:
    return likeList

#Default route
@app.route('/')
def index():
  if 'logged' in session.keys():
    return redirect('/home') 
  return redirect('/login')

#Sign in page
@app.route('/signup', methods=['GET', 'POST'])
def signup():
  if request.method == "POST":
    newName = request.form.get('name')
    newUserName = request.form.get('username')
    newPass = request.form.get('password')
    newEmail = request.form.get('email')
    newPhone = request.form.get('phonenumber')
    newOccupation = request.form.get('occupation')
    if newOccupation == "Others":
      newOccupation = request.form.get('others')
    newAccount = Accounts(name=newName, userName=newUserName, password=newPass, email=newEmail, phoneNumber=newPhone, occupation=newOccupation)
    try:
      db.session.add(newAccount)
      db.session.commit()
      session.pop('signupEr', None)
      return redirect('/login')
    except:
      session['signupEr'] = 'username or email existed, please use another one'
      return redirect('signup')

  else:
    accounts = Accounts.query.order_by(Accounts.id).all()
    if 'signupEr' in session.keys():
      return render_template('signup.html', accounts=accounts, error=session['signupEr'])
    return render_template('signup.html', accounts=accounts, error=None)
  

#login page
@app.route('/login', methods=['GET', 'POST'])
def login():
  if request.method == "POST":
    typedUserName = request.form.get('username')
    typedPassword = request.form.get('password')
    accountInfo = Accounts.query.filter_by(userName = typedUserName).first()
    if accountInfo:
      if accountInfo.password == typedPassword:
        session['logged'] = True
        session['username'] = typedUserName
        session['id'] = accountInfo.id
        session.modified=True
        session.pop('loginEr', None)
        return redirect('/home')
    session['loginEr'] = 'Wrong username or password'
    return redirect('/login')
  else:
    if 'loginEr' in session.keys():
      return render_template('login.html', error=session['loginEr'])
    return render_template('login.html', error=None)

#home page
@app.route('/home', methods=['GET','POST'])
def home():
  accID = session['id']
  userName = session['username']
  accountInfo = Accounts.query.filter_by(userName = userName).first()
  if accountInfo.hasNull():
    return redirect('/updateInfo')
  posts = Posts.query.filter_by(accID = accID).all()
  for post in posts:
    likes = Likes.query.filter_by(postID=post.id).all()
    if len(likes) > 0:
      post.likeStr = generateLikeStr(likes, session['username'])
      db.session.commit()
  return render_template('home.html', userName = userName, posts = posts)

#update user's info if not provided enough info
@app.route('/updateInfo', methods=['GET', 'POST'])
def updateInfo():
  userName = session['username']
  accountInfo = Accounts.query.filter_by(userName = userName).first()
  if request.method == "POST":
    accountInfo.name = request.form.get('name')
    accountInfo.phoneNumber = request.form.get('phonenumber')
    if request.form.get('occupation') == "Others":
      accountInfo.occupation = request.form.get('others')
    else:
      accountInfo.occupation = request.form.get('occupation')
    db.session.commit()
    if accountInfo.hasNull():
      return redirect('/updateInfo')
    else:
      return redirect('/home')
  else:
    return render_template('updateInfo.html', account = accountInfo)

#logout route
@app.route('/logout', methods=['GET', 'POST'])
def logout():
  session.pop('logged', None)
  session.pop('id', None)
  session.pop('username', None)
  return redirect('/login')

#create post page
@app.route('/createPost', methods=['GET', 'POST'])
def createPost():
  accId = session['id']
  userName = session['username']
  if request.method == "POST":
    newTitle = request.form.get('title')
    newContent = request.form.get('content')
    if newContent == None or newContent == '':
      session['postEr'] = "Post can't be empty!"
      return render_template('createPost.html', error=session['postEr'])
    newPost = Posts(content=newContent, accID=accId, title=newTitle, userName=userName)
    try:
      db.session.add(newPost)
      db.session.commit()
      session.pop('postEr', None)
      return redirect('/home')
    except:
      session['postEr'] = 'Error creating new post, please try again'
      return render_template('createPost.html', error=session['postEr'])
  else:
    if 'postEr' in session.keys():
      return render_template('createPost.html', error=session['postEr'])
    return render_template('createPost.html', error=None)

#News feed page
@app.route('/feed', methods=['GET', 'POST'])
def feed():
  posts = Posts.query.order_by(Posts.id).all()
  for post in posts:
    likes = Likes.query.filter_by(postID=post.id).all()
    if len(likes) > 0:
      post.likeStr = generateLikeStr(likes, session['username'])
      db.session.commit()
  return render_template('feed.html', posts=posts)

#add new like
@app.route('/like/<int:id>', methods=['GET', 'POST'])
def like(id):
  accID = session['id']
  userName = session['username']
  existed = Likes.query.filter_by(postID=id, accID=accID).first()
  print(existed)
  if not existed:
    newLike = Likes(accID=accID, postID=id, userName=userName)
    try:
      db.session.add(newLike)
      post = Posts.query.filter_by(id=id).first()
      likes = Likes.query.filter_by(postID=id).all()
      post.likeStr = generateLikeStr(likes, userName)
      db.session.commit()
    except:
      return redirect('/feed')
  return redirect('/feed')

#post detailed page
@app.route('/post/<int:id>', methods=['GET', 'POST'])
def post(id):
  post = Posts.query.filter_by(id=id).first()
  likes = Likes.query.filter_by(postID=id).all()
  if len(likes) > 0:
    post.likeStr = generateLikeStr(likes, session['username'])
    db.session.commit()
  return render_template('post.html', post=post)

#Like list
@app.route('/likeList/<int:id>', methods=['GET', 'POST'])
def likeList(id):
  post = Posts.query.filter_by(id=id).first()
  likes = Likes.query.filter_by(postID=id).all()
  likeList = generateLikeStr(likes, session['username'], True)
  return render_template('likeList.html', liked=likeList)


if __name__ == "__main__":
  app.run(debug=True)
