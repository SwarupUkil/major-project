# Project Reflection

## Problem 1
Perhaps not hardest, but the most annoying problem faced while coding was dealing with the program crashing because of miswriting the names for variables 
and or just forgetting what I named certain variables. Problems like these though only take a few seconds to fix, they slowly add up 
to a considerable amount of time wasted.

## Problem 2
The geniunely hardest problem was making a border detection to keep the player in bounds. Like keeping the player from walking or dashing past the circular
maps required a significant amount of thinking and debugging. It also leads up to the next problem of loops.

## Problem 3
Another problem faced was the lag of too many loops, I fixed this by just reducing the spawn rate of objects and deleting them the moment they were no longer
needed. As for the border detection looping problem, for the dash because I wanted the player to also dash to the edge of the map over just stopping them in place
if they were about to jump past the map. This required a while loop which I had difficulty implementing properly which lead to a lot of time debugging, especially
because I did not know how to use the break point on VS Code, and I could not bring up the console on the live server because of the while loop, which required me
to manually figure out what went wrong.

## Problem 4
The boss' attacks with the arcs were also pretty difficult because I did not understand how the colllisionPointArc() worked; 
though after learning how the rotate and translate function worked. Implementing the attack was fairly easy.

*Aside from these, everything worked relatively straight forward.*

## Did I complete the "needs to have" list?
Yes, everything on the needs to have list was completed. I am a bit disapointed that I could not get to the nice to have list but it is what it is.

## Were there any problems you could not solve?
I believe I solved every problem I had, there might be bugs that I missed but like everything I wanted to build works like how I intended them to.

## Final Thoughts and Advice
I am very proud of my final product, I was concerned I would reach this point when I started working on it in January but it has turned out great. A few things I would
do differently were I to do a project like this again is probably spend a lot more time planning out what I need and how I would reach that end. Probably through writing
comments detailing the steps in the function and then aftewards implementing them. I would also make sure to start off with a naming scheme for similar variables like all
the damage variables being the nameDmg.
