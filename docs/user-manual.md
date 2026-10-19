# User Manual

This guide explains how to use Marketplace as a **freelancer** (student), a **client**
(someone who posts work) or an **administrator**. It describes the application as it is
currently built. Items marked *(requires confirmation)* could not be fully verified from
the source code and may behave differently in practice.

- [Introduction](#introduction)
- [Accounts and sign-in](#accounts-and-sign-in)
- [Navigating the application](#navigating-the-application)
- [For freelancers](#for-freelancers)
- [For clients](#for-clients)
- [Working on a contract (both roles)](#working-on-a-contract-both-roles)
- [Messages](#messages)
- [Meetings](#meetings)
- [Notifications](#notifications)
- [Your profile](#your-profile)
- [For administrators](#for-administrators)
- [Common messages and what they mean](#common-messages-and-what-they-mean)
- [Troubleshooting](#troubleshooting)
- [Known limitations](#known-limitations)

## Introduction

Marketplace connects university students who want to take on freelance work with clients
who need work done.

- **Clients** post jobs with a budget, review proposals from students, accept one, and
  manage the work through milestones, chat and video meetings.
- **Freelancers** browse jobs, send proposals, and deliver work through the contract page.

You need a modern web browser. Video meetings need a camera and microphone.

## Accounts and sign-in

### Choosing a role

Each account has one role, chosen at registration, and it cannot be changed. If you want
to both post and do work, register two accounts with different email addresses.

### Registering as a freelancer

1. Open **Register** and choose **I'm a Freelancer**.
2. Fill in first name, last name, email, phone, username, student ID, password and
   password confirmation.
3. Your email **must use your university's email domain**. Only domains approved by the
   administrators are accepted.
4. Submit. You will receive a verification email (see below).

You can also choose **Google** on the registration page to sign up with your university
Google account. This creates your account immediately without a verification email.
*(Requires confirmation: accounts created with Google may not have a complete profile and
some features may not work for them; see [Known limitations](#known-limitations).)*

### Registering as a client

1. Open **Register** and choose **I'm a Client**.
2. Fill in first name, last name, email, phone, username, password, password
   confirmation and optionally your company name.
3. Submit and verify your email.

Registering as a client with Google requires a student ID and a university email address.

### Verifying your email

1. Open the email titled **"Verify your email"** and click the link.
2. The page confirms that your email is verified; you can then sign in.

The link is valid only for a short time (2 minutes by default). If it has expired, the
page lets you request a new link. You can request a new link once.

### Signing in

1. Open **Login**.
2. Enter your email and password, or use the Google button if you registered with Google.
3. Optionally tick **Remember me** to stay signed in longer (30 days instead of 7).

Do not use **Remember me** on shared or public computers.

### Forgotten password

1. On the login page choose **Forgot password?**
2. Enter your email address. You receive an email with a 6-character code.
3. Enter the code, then choose and confirm a new password.

The code is valid for 5 minutes by default. If you request a new code while the previous
one is still valid, no new email is sent; use the code you already received.

### Signing out

Use **Logout** in the profile menu (top right). If you are suddenly asked to sign in again
while using the site, your session has expired; sign in again.

## Navigating the application

The top navigation bar shows:

| Link | Who sees it | What it opens |
|---|---|---|
| **Dashboard** | Everyone | The job board. |
| **Meetings** | Signed-in users | Your scheduled meetings. |
| **My Jobs** | Clients | Jobs you have posted. |
| **My Bids** | Freelancers | Proposals you have sent. |
| Manage work menu → **Manage Work**, **Contracts** | Clients and freelancers | Work overview and your contracts. |
| **Messages** | Signed-in users | Your conversations. |
| Profile menu | Signed-in users | Your profile and logout. |

A theme toggle switches between light and dark mode.

## For freelancers

### Finding jobs

1. Open **Dashboard**.
2. Use the search box and filters (category, skills, tags, budget, experience level,
   status) to narrow the list. Use the page controls at the bottom to see more jobs.
3. Click a job to see details: description, budget, duration, required skills, experience
   level, and the client's information including whether their payment method is
   verified.

You can copy a share link for a job from the job details.

### Sending a proposal (bid)

1. Open a job and click **Apply for this Job**. The button shows **Applied** if you have
   already applied and **Closed** for closed jobs.
2. Write a cover letter.
3. Enter your bid amount. For **fixed-price** jobs the amount is set automatically to the
   job's budget; otherwise it must be between the job's minimum and maximum budget.
4. Optionally attach images (for example screenshots of previous work).
5. Click **Submit Application**.

You can only apply to jobs that are **open**.

### Tracking your proposals

Open **My Bids** to see your proposals and their status:

| Status | Meaning |
|---|---|
| Pending | Sent, not yet reviewed. |
| Reviewed | The client has looked at it. |
| Accepted | You got the job; a contract has been created. |
| Rejected | The client declined it. |
| Closed | The client accepted someone else's proposal. |

While a proposal is **Pending**, **My Bids** shows a delete option to withdraw it.

When your proposal is accepted you receive notifications and can start chatting with the
client. The job then appears under **Contracts**.

## For clients

### Posting a job

1. Open **My Jobs** and click **Create Job**.
2. Fill in the form:

   | Field | Notes |
   |---|---|
   | Title, Description | What you need done. |
   | Category and Skills | Choose from the lists. |
   | Tags | Free keywords to help freelancers find the job. |
   | Minimum and maximum budget | Minimum must be greater than 0 and not above the maximum. |
   | Fixed price | If ticked, every proposal is priced at your minimum budget. |
   | Duration | For example "1 month". |
   | Experience level | Entry, Intermediate or Expert. |
   | Minimum / maximum proposals | Minimum must be at least 1 and not above the maximum. |
   | Status | **Draft** (hidden from freelancers) or **Open** (visible and accepting proposals). |

3. Save. Draft jobs are only visible to you.

### Managing your jobs

In **My Jobs** you can open, edit or delete your jobs.

- You can switch a job between **Draft** and **Open**.
- Once you accept a proposal, the job becomes **In Progress** and can no longer be edited.

### Paying for a job

From **My Jobs**, open a job and click **Pay Now** (shown while your payment method is not
verified).

1. You are redirected to the Paystation payment page. Complete the payment there.
2. You are returned to a payment result page showing the status.

The amount charged is the job's minimum budget. *(Requires confirmation: a successful
payment currently does not change the "payment verified" badge automatically; an
administrator can set it.)*

### Reviewing proposals and hiring

1. Open a job and click **View Bids**.
2. Review each proposal: the freelancer's profile, cover letter, attachments and bid.
3. Change a proposal's status to **Reviewed**, **Rejected** or **Accepted**.

Accepting a proposal:
- creates a contract with the freelancer at the bid amount;
- moves the job to **In Progress**;
- closes all other proposals for that job and notifies those freelancers;
- opens a chat conversation with the freelancer.

Accept only one proposal per job. An accepted proposal cannot be changed afterwards.

## Working on a contract (both roles)

Open **Contracts** and select a contract. The contract page shows an overview (description,
client, freelancer, budget, dates), project progress, milestones and meetings.

### Milestones (clients)

Milestones split the work into steps.

1. Click **Create New Milestone** and enter a title, description, amount, start date and
   due date.
2. Rules:
   - the start date cannot be in the past and the due date must be after the start date;
   - each step's amount must be greater than 0 and **less than** the contract budget;
   - the total of all steps cannot exceed the contract budget.
3. Review the freelancer's work and set a step to **In Review**, **Accepted** or
   **Rejected**.

When every step is accepted, the milestone plan shows as completed.

### Submitting work (freelancers)

1. Open the contract and find the milestone step.
2. Upload your work as a **ZIP file** and add an optional message.
3. The client is able to download your file from the contract page.

*(Requires confirmation: parts of the submission history and "edit submission" screens use
features that are not available on the server yet and may show errors.)*

## Messages

Open **Messages** to see your conversations. A conversation is created automatically when
a client accepts a freelancer's proposal; you cannot start a conversation with someone you
have no contract with.

- Messages appear instantly for both participants.
- You can see when the other person is typing and when your messages have been seen.
- Messages are limited to 1000 characters.

## Meetings

Video meetings use Jitsi and run inside the browser.

**Clients** schedule meetings:
1. Open an active contract from **Contracts** and click **Create Meeting**.
2. Enter a topic, date, time and duration.

**Both** participants join from **Meetings** or the contract page. Only the client and the
freelancer of that contract can join. The client joins as the meeting moderator.

The scheduled time is for information; the room can be opened at any time. If the meeting
asks you to authenticate again after about an hour, leave and rejoin from the Meetings
page.

## Notifications

The notification menu in the navigation bar shows alerts such as accepted or closed
proposals. New notifications appear without reloading. You can mark a notification, or all
of them, as read. A sound can play when a notification arrives (browser permission may be
required).

## Your profile

Open the profile menu → your profile.

- **Everyone** can edit name, phone and avatar (profile picture).
- **Freelancers** can set availability and maintain a professional profile: hourly rate,
  hours per week, bio, LinkedIn/Twitter/GitHub/portfolio links, skills, projects,
  experience and education.
- **Clients** can edit company name, bio and social links.
- Email address and role cannot be changed.
- You can view other users' profiles by clicking their names.

When editing your professional profile, make sure you save the complete profile; removing
a profile section and saving can remove related information.

## For administrators

Administrators use two tools:

**Django admin** (`/admin/` on the API server). Sign in with a staff account.
- **Settings**: the website address used in emails and payment redirects, the backend
  address for payment callbacks, and how long verification links and reset codes stay
  valid. Check these after every new installation.
- **Accepted Domains**: add the university email domains that freelancers may register
  with. Deactivate a domain to stop new sign-ups from it.
- **Users and profiles**: activate users, mark emails as verified, set a client's
  "payment verified" flag, grant staff permissions.
- **Jobs, proposals, contracts, milestones, payments, chat, notifications**: view and
  correct data. Every change is kept in the record's history.
- Completing or cancelling contracts and closing jobs is currently done here.

**Admin pages in the web application** (`/admin`). Available to accounts with the admin
role. Pages: Users, Jobs, Bids, Contracts, Milestones. The Reports and Settings pages are
placeholders and do not show real data or change anything.

## Common messages and what they mean

| Message | Meaning and what to do |
|---|---|
| "Try with your varsity mail address" | The email domain is not approved. Use your university email or ask an administrator. |
| "This student ID is already registered" | Another account uses this student ID. |
| "Email already exists" / "Username already exists" | Choose a different one, or sign in. |
| "Password doesn't matched" | The password and confirmation differ. |
| "Email is not verified. Please verify your email." | Click the link in the verification email first. |
| "User with this email does not exist." / "Invalid credential." | Check the email and password. |
| "This link has expired. Please request a new verification link." | Use the resend option on the page. |
| "Invalid OTP" / "OTP is expired" | Check the code or request a new one after the old one expires. |
| "The job must be open to submit a proposal." | The job is not accepting proposals. |
| "Bid amount cannot be less than / exceed …" | Enter an amount within the job's budget range. |
| "Cannot modify an accepted proposal." | Accepted proposals are final. |
| "Start date cannot be in the past" / "Due date must be greater than start date" | Adjust the milestone dates. |
| "Step amount … must be less than contract budget" / "Total milestone budget … cannot exceed contract budget" | Reduce the step amount. |
| "You are not authorized to join this meeting" | You are not part of this contract. |

## Troubleshooting

| Problem | What to try |
|---|---|
| No verification or reset email | Check spam. Wait a few minutes. Ask an administrator if it never arrives. |
| Signed out unexpectedly | Your session expired. Sign in again. |
| Live chat or notifications stop updating | Reload the page. Check your internet connection. |
| Images or files do not open | Reload; if the problem continues, report it to an administrator. |
| Payment completed but status not updated | Open the payment result page again from the link in the job; contact an administrator with the invoice number. |
| Meeting asks to sign in or shows an error | Rejoin from the Meetings page. |

For technical troubleshooting see [troubleshooting.md](troubleshooting.md). A support
contact address is shown on the home page when configured. *(Escalation process requires
project-owner confirmation.)*

## Known limitations

- **Connects**, **escrow**, **automatic payouts to freelancers** and **service fees**
  mentioned on the home page are not implemented.
- Contracts and jobs are not marked completed automatically; administrators do this.
- One proposal per job is not enforced; freelancers should apply only once.
- Accounts created with Google may be missing profile data needed by some features.
- See [known-issues.md](known-issues.md) for the full technical list.
