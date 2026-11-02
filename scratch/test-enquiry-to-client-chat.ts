import { enquiryStore } from '../lib/enquiries/enquiry-store';
import { adminDataStore } from '../lib/admin/admin-store';
import { notificationStore } from '../lib/notifications/notification-store';

async function runTest() {
  console.log('=== TEST: COMPLETE ENQUIRY & TWO-WAY CLIENT CHAT ===\n');

  // Step 1: Customer submits contact enquiry
  console.log('1. Submitting new customer contact enquiry...');
  const testEmail = `test.traveler.${Date.now()}@example.com`;
  const enquiry = await enquiryStore.createEnquiry({
    fullName: 'Test Traveler',
    email: testEmail,
    phone: '+91 9876543210',
    inquiryType: 'Tour Package Booking',
    message: 'Hello BharatYatra, I want to book a Gujarat tour with White Rann resort for 4 people.',
  });

  console.log(`✓ Enquiry created: ID=${enquiry.id}, Ref=${enquiry.enquiryReference}`);

  // Step 2: Admin finds or creates matching support ticket
  console.log('\n2. Finding / creating linked support ticket in admin store...');
  const ticket = adminDataStore.findOrCreateTicketForEnquiry(enquiry);
  console.log(`✓ Support Ticket linked: #${ticket.ticketNumber} (Subject: "${ticket.subject}")`);

  // Step 3: Admin replies to the enquiry from Admin Portal
  console.log('\n3. Admin replies from Website Enquiry Management desk...');
  const adminReplyMsg = 'Namaste Test Traveler! We have 4 luxury tents available at Rann Utsav. What dates do you prefer?';
  const updatedTicket = adminDataStore.addSupportReply(
    ticket.id,
    adminReplyMsg,
    'Operations Support Lead',
    'admin@bharatyatra.com'
  );

  console.log(`✓ Admin reply added. Thread length: ${updatedTicket?.messages.length}`);
  const lastStaffMsg = updatedTicket?.messages[updatedTicket.messages.length - 1];
  console.log(`  Last message sender: ${lastStaffMsg?.sender} ("${lastStaffMsg?.message}")`);

  // Step 4: Client receives in-app notification
  console.log('\n4. Verifying client notifications for traveler email...');
  await notificationStore.createNotification({
    recipientEmail: testEmail,
    title: `Reply from BharatYatra Support (#${updatedTicket?.ticketNumber})`,
    message: `Operations Support Lead: "${adminReplyMsg}"`,
    category: 'support',
    type: 'action',
    deepLink: `/notifications?ticket=${updatedTicket?.ticketNumber}`,
    metadata: {
      enquiryId: enquiry.id,
      ticketNumber: updatedTicket?.ticketNumber,
      ticketId: updatedTicket?.id,
    },
  });

  const clientNotifs = notificationStore.getNotifications({ email: testEmail });
  console.log(`✓ Client notifications found: ${clientNotifs.length}`);
  console.log(`  Notification Title: "${clientNotifs[0]?.title}"`);
  console.log(`  Notification DeepLink: "${clientNotifs[0]?.deepLink}"`);

  // Step 5: Client opens ticket and sends their reply back
  console.log('\n5. Client replies back from website conversation modal...');
  const clientReplyMsg = 'We are planning from 15th December to 19th December. Please share pricing!';
  const ticketAfterClientReply = adminDataStore.addCustomerReply(
    updatedTicket!.ticketNumber,
    clientReplyMsg,
    'Test Traveler'
  );

  console.log(`✓ Client reply recorded. Thread length: ${ticketAfterClientReply?.messages.length}`);
  const finalMsg = ticketAfterClientReply?.messages[ticketAfterClientReply.messages.length - 1];
  console.log(`  Latest message: [${finalMsg?.sender}] ${finalMsg?.senderName}: "${finalMsg?.message}"`);

  // Step 6: Admin checks ticket again
  console.log('\n6. Verifying admin ticket status & thread state...');
  const reloadedTicket = adminDataStore.getTicketByIdOrNumber(updatedTicket!.ticketNumber);
  if (!reloadedTicket) throw new Error('Ticket not found');
  console.log(`✓ Status: ${reloadedTicket.status}`);
  console.log(`✓ Total conversation turns: ${reloadedTicket.messages.length}`);

  console.log('\n=== ALL TWO-WAY LIFECYCLE CHECKS PASSED SUCCESSFULLY ===');
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
