from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, marshal_with, Resource, reqparse, abort, fields

db = SQLAlchemy()
api = Api()

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
  

accountPutArgs = reqparse.RequestParser()
accountPutArgs.add_argument("name", type=str, help="Name of the user")
accountPutArgs.add_argument("userName", type=str, help="Username is required", required=True)
accountPutArgs.add_argument("password", type=str, help="Password is required", required=True)
accountPutArgs.add_argument("email", type=str, help="Email is required", required=True)
accountPutArgs.add_argument("phoneNumber", type=str, help="Phone number of the user")
accountPutArgs.add_argument("occupation", type=str, help="Occupation of the user")

accountPatchArgs = reqparse.RequestParser()
accountPatchArgs.add_argument("name", type=str, help="Name of the user")
accountPatchArgs.add_argument("phoneNumber", type=str, help="Phone number of the user")
accountPatchArgs.add_argument("occupation", type=str, help="Occupation of the user")


accountFields = {
  'id': fields.Integer,
	'name': fields.String,
	'userName': fields.String,
	'password': fields.String,
	'email': fields.String,
	'phoneNumber': fields.String,
	'occupation': fields.String
}

#MySQL table Posts 
class Posts(db.Model):
  __tablename__ = "posts"
  id = db.Column(db.Integer, primary_key=True)
  title = db.Column(db.String(50), nullable=False)
  content = db.Column(db.Text)
  userName = db.Column(db.String(100), db.ForeignKey('accounts.userName'), nullable=False)
  accID = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)


postPutArgs = reqparse.RequestParser()
postPutArgs.add_argument("title", type=str, help="Title is required", required=True)
postPutArgs.add_argument("content", type=str, help="Content can't be empty", required=True)
postPutArgs.add_argument("accID", type=int, help="Post's account ID")
postPutArgs.add_argument("userName", type=str, help="Post's account userName")

postPatchArgs = reqparse.RequestParser()
postPatchArgs.add_argument("likeStr", type=str, help="")


postFields = {
  'id': fields.Integer,
	'title': fields.String,
	'content': fields.String,
	'userName': fields.String,
  'accID': fields.Integer
}

#MySQL table Likes
class Likes(db.Model):
  __tablename__ = "likes"
  id = db.Column(db.Integer, primary_key=True)
  postID = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
  accID = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
  userName = db.Column(db.String(100), db.ForeignKey('accounts.userName'), nullable=False)

likePutArgs = reqparse.RequestParser()
likePutArgs.add_argument("accID", type=int, help="Account ID is required", required=True)
likePutArgs.add_argument("userName", type=str, help="UserName is required", required=True)

likeFields = {
  'id': fields.Integer,
	'postID': fields.Integer,
	'accID': fields.Integer,
	'userName': fields.String,
}



#Query all from Accounts table 
class AccountQueryAll(Resource):
  @marshal_with(accountFields)
  def put(self):
    args = accountPutArgs.parse_args()
    userName = args['userName']
    result = Accounts.query.filter_by(userName=userName).first()
    if result:
      abort(409, message="Account already existed")

    account = Accounts(name=args['name'], userName=userName, password=args['password'], email=args['email'], phoneNumber=args['phoneNumber'], occupation=args['occupation'])
    db.session.add(account)
    db.session.commit()
    return account, 201

api.add_resource(AccountQueryAll, "/account")

#Query Accounts table by user name
class AccountQueryByUserName(Resource):
  @marshal_with(accountFields)
  def get(self, userName):
    result = Accounts.query.filter_by(userName=userName).first()
    if not result:
      abort(404, message="Account not found")
    return result
api.add_resource(AccountQueryByUserName,"/account/<string:userName>")


#Query Accounts table with id
class AccountQueryByID(Resource):
  @marshal_with(accountFields)
  def patch(self, id):
    args = accountPatchArgs.parse_args()
    result = Accounts.query.filter_by(id=id).first()
    if not result:
      abort(404, message="Account not found, cannot update information")
    if args['name']:
      result.name = args['name']
    if args['phoneNumber']:
      result.phoneNumber = args['phoneNumber']
    if args['occupation']:
      result.occupation = args['occupation']
    db.session.commit()
    return result

api.add_resource(AccountQueryByID,"/account/<int:id>")

#Query all from Posts table 
class PostQueryAll(Resource):
  @marshal_with(postFields)
  def get(self):
    result = Posts.query.order_by(Posts.id).all()
    if not result:
      abort(404, message="No posts available")
    return result
  
  @marshal_with(postFields)
  def put(self):
    args = postPutArgs.parse_args()
    post = Posts(title=args['title'], content=args['content'], accID=args['accID'], userName=args['userName'])
    db.session.add(post)
    db.session.commit()
    return post, 201

api.add_resource(PostQueryAll,"/post")

#Query Posts table with id
class PostQueryByID(Resource):
  @marshal_with(postFields)
  def get(self, id):
    result = Posts.query.filter_by(id=id).first()
    if not result:
      abort(404, message="Post not found")
    return result

api.add_resource(PostQueryByID,"/post/<int:id>")

class LikeQueryByPostID(Resource):
  @marshal_with(likeFields)
  def get(self, postID):
    result = Likes.query.filter_by(postID = postID).all()
    if not result:
      abort(404, message="No likes available")
    return result
  
  @marshal_with(likeFields)
  def put(self, postID):
    args = likePutArgs.parse_args()
    result = Likes.query.filter_by(postID = postID, accID=args['accID']).first()
    if result:
      abort(409, message="Like already existed")
    like = Likes(postID=postID, accID=args['accID'], userName=args['userName'] )
    db.session.add(like)
    db.session.commit()
    return like, 201

api.add_resource(LikeQueryByPostID,"/like/<int:postID>")
  