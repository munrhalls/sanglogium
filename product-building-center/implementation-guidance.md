this is metacode for what should be on filters sorting product ux for end user.
now: there's great risk that agent executing it will start to launch stupid dumb unnecessary verification attempts, expensive commands, npm run dev etc., or start to run lints which is stupid and in general hallucinate or start to take on too much at once, or do whatever else causes agent to do doom combination: a) take super longtime + b) fail and deliver crap that does not work and then we are in position c) wasted time + its hard to fix.

we should split it into phases and tasks. and then, feed to agent on phase of small tasks at a time.
please prepare phases and tasks in .md file inside c:\webdev\sang-logium\product-building-center\filters-sorting. they are meant for deepseek v4 flash agent to execute reliably, phase by phase. make sure agent will never take on too much at once.

we must ensure agent just codes the blueprint we made and does literally nothing else. no verifications, no stupid dumb attempts to lint or do idk what extra. 0 extra. just code the blueprint. leanest execution possible.