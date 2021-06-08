# Blog-Prototype
⚓This repository is my entrance exam to Got It, Inc.

The instruction is listed as follow:
# Introduction
Got It would like to build a blog where people can register accounts, write blog posts, and interact with each other. This blog has the following features.
# Accounts
- [x] New accounts can be registered via Facebook or Google </br>
- [x] If the email already exists in the system, then the user’s Facebook or Google account must be linked to the same account. For example:</br>
- Alex has successfully registered an account with his Facebook account. The email used to sign in to his Facebook account is alex@gmail.com</br>
- Alex tries to register another account with his Google account alex@gmail.com</br>
- We need to let Alex know that the email already exists and if Alex wants to use his Google account to log in, then he needs to confirm by logging in with his Facebook account. In this case, we consider Alex as a Facebook user.</br>
- [x] After registering successfully, a user needs to provide some additional information.</br>
- [x] Facebook users need to provide their names and phone numbers.</br>
- [x] Google users need to provide their names and occupations.</br>
- [x] The users can select their occupations from the following options.</br>
- Student</br>
- Teacher</br>
- Other</br>
- [x] If a user selects Other, then it must be specified.</br>
- [x] If a user does not provide all the information above, then s/he is still able to log in. After logging in, the user will see a form to fill in the information and can do nothing else until all the required information is provided.</br>
# Posts
- [x] After providing all the required information, a user can start writing blog posts.</br>
- [x] Each blog post has a title and a body.</br>
- [x] A blog post can be liked by other users.</br>
- [x] There are three main pages:</br>
- [x] A home page which shows a list of all posts of all users</br>
- [x] A personal page which shows a list of all posts of a user</br>
- [x] A post detail page which displays the full content of a post</br>
- [x] Each post on the home and personal pages will show the full title and part of the body.</br>
- [x] The name of the people who liked a post will be shown below the post like this: A, B, and n other people liked this post.</br>
- [x] By clicking on this line, al list of all people who liked the post will be shown.</br>
# Requirements
- [x] You need to build RESTful APIs for this blog site using Python, Flask, and MySQL.</br>
- [x] The frontend site is NOT required.</br>
- [x] Data must be returned to the client in JSON format.</br>
- [x] The source code needs to be pushed to GitHub with installation instructions.</br>
