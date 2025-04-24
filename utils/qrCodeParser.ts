// utils/qrCodeParser.ts
import { Linking, Share, Clipboard } from 'react-native';
import * as Contacts from 'expo-contacts';

// Types of QR codes we'll support
export enum QRCodeType {
  URL = 'URL',
  APP_LINK = 'APP_LINK',
  WIFI = 'WIFI',
  CONTACT = 'CONTACT',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PHONE = 'PHONE',
  GEO = 'GEO',
  CALENDAR = 'CALENDAR',
  TEXT = 'TEXT', // Default fallback
}

// Structure for parsed QR data
export interface ParsedQRCode {
  type: QRCodeType;
  rawData: string;
  title: string;
  subtitle?: string;
  parsedData: any;
  primaryAction?: {
    label: string;
    action: () => Promise<void>;
  };
  secondaryActions?: Array<{
    icon: string;
    label: string;
    action: () => Promise<void>;
  }>;
}

// Parse raw QR code data
export function parseQRCode(data: string): ParsedQRCode {
  // URL detection
  if (data.startsWith('http://') || data.startsWith('https://')) {
    return parseURL(data);
  }
  
  // App link detection (exp://, fb://, twitter://, etc.)
  if (/^[a-zA-Z0-9.+-]+:\/\//.test(data) && !data.startsWith('mailto:') && !data.startsWith('tel:') && !data.startsWith('sms:') && !data.startsWith('smsto:') && !data.startsWith('geo:')) {
    return parseAppLink(data);
  }
  
  // WiFi detection
  if (data.startsWith('WIFI:')) {
    return parseWifi(data);
  }
  
  // Contact/vCard detection
  if (data.startsWith('BEGIN:VCARD')) {
    return parseVCard(data);
  }
  
  // Email detection
  if (data.startsWith('mailto:')) {
    return parseEmail(data);
  }
  
  // SMS detection
  if (data.startsWith('smsto:') || data.startsWith('sms:')) {
    return parseSMS(data);
  }
  
  // Phone detection
  if (data.startsWith('tel:')) {
    return parsePhone(data);
  }
  
  // Geographic location detection
  if (data.startsWith('geo:')) {
    return parseGeo(data);
  }
  
  // Calendar event detection
  if (data.startsWith('BEGIN:VEVENT')) {
    return parseCalendar(data);
  }
  
  // Default to text
  return parseText(data);
}

// URL parser
function parseURL(data: string): ParsedQRCode {
  const url = new URL(data);
  return {
    type: QRCodeType.URL,
    rawData: data,
    title: 'Website',
    subtitle: url.hostname,
    parsedData: { url: data },
    primaryAction: {
      label: 'Open Website',
      action: async () => {
        await Linking.openURL(data);
      },
    },
    secondaryActions: [
      {
        icon: 'copy-outline',
        label: 'Copy URL',
        action: async () => {
          await Clipboard.setString(data);
        },
      },
      {
        icon: 'share-outline',
        label: 'Share',
        action: async () => {
          await Share.share({ url: data });
        },
      }
    ],
  };
}

// App link parser
function parseAppLink(data: string): ParsedQRCode {
  // Extract scheme for display
  const scheme = data.split('://')[0];
  const displayScheme = scheme.charAt(0).toUpperCase() + scheme.slice(1);
  
  return {
    type: QRCodeType.APP_LINK,
    rawData: data,
    title: 'App Link',
    subtitle: displayScheme,
    parsedData: { url: data },
    primaryAction: {
      label: 'Open in App',
      action: async () => {
        try {
          const supported = await Linking.canOpenURL(data);
          
          if (supported) {
            await Linking.openURL(data);
          } else {
            alert(`Cannot open this app link: ${data}\nNo app installed that can handle this link.`);
          }
        } catch (error) {
          console.error('Error opening app link:', error);
          alert('Failed to open app link');
        }
      },
    },
    secondaryActions: [
      {
        icon: 'copy-outline',
        label: 'Copy Link',
        action: async () => {
          await Clipboard.setString(data);
          alert('Link copied to clipboard');
        },
      },
      {
        icon: 'share-outline',
        label: 'Share',
        action: async () => {
          await Share.share({ message: data });
        },
      }
    ],
  };
}

// WiFi parser
function parseWifi(data: string): ParsedQRCode {
  // WIFI:S:<SSID>;T:<WPA|WEP|>;P:<password>;;
  const ssidMatch = data.match(/S:(.*?);/);
  const typeMatch = data.match(/T:(.*?);/);
  const passwordMatch = data.match(/P:(.*?);/);
  
  const ssid = ssidMatch ? ssidMatch[1] : 'Unknown Network';
  const type = typeMatch ? typeMatch[1] : 'Unknown';
  const password = passwordMatch ? passwordMatch[1] : '';
  
  return {
    type: QRCodeType.WIFI,
    rawData: data,
    title: 'WiFi Network',
    subtitle: ssid,
    parsedData: { ssid, type, password },
    primaryAction: {
      label: 'Copy Password',
      action: async () => {
        await Clipboard.setString(password);
      },
    },
    secondaryActions: [
      {
        icon: 'copy-outline',
        label: 'Copy Network Name',
        action: async () => {
          await Clipboard.setString(ssid);
        },
      }
    ],
  };
}

// Contact/vCard parser
function parseVCard(data: string): ParsedQRCode {
  // Extract name
  const nameMatch = data.match(/FN:(.*?)(?:\r?\n|\r|$)/);
  const name = nameMatch ? nameMatch[1] : 'Unknown Contact';
  
  // Extract phone
  const phoneMatch = data.match(/TEL.*?:(.*?)(?:\r?\n|\r|$)/);
  const phone = phoneMatch ? phoneMatch[1] : '';
  
  // Extract email
  const emailMatch = data.match(/EMAIL.*?:(.*?)(?:\r?\n|\r|$)/);
  const email = emailMatch ? emailMatch[1] : '';
  
  return {
    type: QRCodeType.CONTACT,
    rawData: data,
    title: 'Contact',
    subtitle: name,
    parsedData: { name, phone, email },
    primaryAction: phone ? {
      label: 'Call Contact',
      action: async () => {
        await Linking.openURL(`tel:${phone}`);
      },
    } : undefined,
    secondaryActions: [
      {
        icon: 'person-add-outline',
        label: 'Add to Contacts',
        action: async () => {
          try {
            // Request permission to access contacts
            const { status } = await Contacts.requestPermissionsAsync();
            
            if (status !== 'granted') {
              alert('Permission to access contacts was denied');
              return;
            }
            
            // Parse name parts
            let firstName = name;
            let lastName = '';
            
            if (name.includes(' ')) {
              const nameParts = name.split(' ');
              firstName = nameParts[0];
              lastName = nameParts.slice(1).join(' ');
            }
            
            // Create the contact object using proper typing
            const contactData: Contacts.Contact = {
              name,
              firstName,
              lastName,
              contactType: Contacts.ContactTypes.Person
            };
            
            // Add phone if available
            if (phone) {
              contactData.phoneNumbers = [
                {
                  number: phone,
                  label: 'mobile'
                }
              ];
            }
            
            // Add email if available
            if (email) {
              contactData.emails = [
                {
                  email: email,
                  label: 'work'
                }
              ];
            }
            
            // Create the contact in the device's contacts
            const contactId = await Contacts.addContactAsync(contactData);
            
            if (contactId) {
              alert(`Contact "${name}" added successfully!`);
            } else {
              throw new Error('Failed to add contact');
            }
          } catch (error) {
            console.error('Error adding contact:', error);
            alert('Failed to add contact: ' + (error instanceof Error ? error.message : String(error)));
            // Fallback to clipboard if contact creation fails
            await Clipboard.setString(data);
          }
        },
      },
      email ? {
        icon: 'mail-outline',
        label: 'Send Email',
        action: async () => {
          await Linking.openURL(`mailto:${email}`);
        },
      } : undefined,
    ].filter(Boolean) as ParsedQRCode['secondaryActions'],
  };
}

// Email parser
function parseEmail(data: string): ParsedQRCode {
  // mailto:email@example.com?subject=Subject&body=Body
  const email = data.replace('mailto:', '').split('?')[0];
  
  // Extract subject and body if available
  const subjectMatch = data.match(/[?&]subject=([^&]*)/);
  const bodyMatch = data.match(/[?&]body=([^&]*)/);
  
  const subject = subjectMatch ? decodeURIComponent(subjectMatch[1]) : '';
  const body = bodyMatch ? decodeURIComponent(bodyMatch[1]) : '';
  
  return {
    type: QRCodeType.EMAIL,
    rawData: data,
    title: 'Email Address',
    subtitle: email,
    parsedData: { email, subject, body },
    primaryAction: {
      label: 'Send Email',
      action: async () => {
        await Linking.openURL(data);
      },
    },
    secondaryActions: [
      {
        icon: 'copy-outline',
        label: 'Copy Address',
        action: async () => {
          await Clipboard.setString(email);
        },
      }
    ],
  };
}

// SMS parser
function parseSMS(data: string): ParsedQRCode {
  // sms:+1234567890?body=message or smsto:+1234567890:message
  let phone = '';
  let message = '';
  
  if (data.startsWith('smsto:')) {
    const parts = data.replace('smsto:', '').split(':');
    phone = parts[0];
    message = parts.length > 1 ? parts[1] : '';
  } else {
    phone = data.replace('sms:', '').split('?')[0];
    const bodyMatch = data.match(/[?&]body=([^&]*)/);
    message = bodyMatch ? decodeURIComponent(bodyMatch[1]) : '';
  }
  
  return {
    type: QRCodeType.SMS,
    rawData: data,
    title: 'SMS Message',
    subtitle: phone,
    parsedData: { phone, message },
    primaryAction: {
      label: 'Send Message',
      action: async () => {
        await Linking.openURL(data);
      },
    },
    secondaryActions: [
      {
        icon: 'call-outline',
        label: 'Call Number',
        action: async () => {
          await Linking.openURL(`tel:${phone}`);
        },
      },
      {
        icon: 'copy-outline',
        label: 'Copy Number',
        action: async () => {
          await Clipboard.setString(phone);
        },
      }
    ],
  };
}

// Phone parser
function parsePhone(data: string): ParsedQRCode {
  const phone = data.replace('tel:', '');
  
  return {
    type: QRCodeType.PHONE,
    rawData: data,
    title: 'Phone Number',
    subtitle: phone,
    parsedData: { phone },
    primaryAction: {
      label: 'Call Number',
      action: async () => {
        await Linking.openURL(data);
      },
    },
    secondaryActions: [
      {
        icon: 'chatbox-outline',
        label: 'Send SMS',
        action: async () => {
          await Linking.openURL(`sms:${phone}`);
        },
      },
      {
        icon: 'copy-outline',
        label: 'Copy Number',
        action: async () => {
          await Clipboard.setString(phone);
        },
      }
    ],
  };
}

// Geographic location parser
function parseGeo(data: string): ParsedQRCode {
  // geo:latitude,longitude
  const coords = data.replace('geo:', '').split(',');
  const latitude = coords[0] || '0';
  const longitude = coords[1] || '0';
  
  return {
    type: QRCodeType.GEO,
    rawData: data,
    title: 'Location',
    subtitle: `${latitude}, ${longitude}`,
    parsedData: { latitude, longitude },
    primaryAction: {
      label: 'Open in Maps',
      action: async () => {
        // Try to open in Google Maps first (works on both platforms)
        await Linking.openURL(`https://maps.google.com/maps?q=${latitude},${longitude}`);
      },
    },
    secondaryActions: [
      {
        icon: 'copy-outline',
        label: 'Copy Coordinates',
        action: async () => {
          await Clipboard.setString(`${latitude},${longitude}`);
        },
      }
    ],
  };
}

// Calendar event parser
function parseCalendar(data: string): ParsedQRCode {
  // Basic parsing of calendar events
  const summaryMatch = data.match(/SUMMARY:(.*?)(?:\r?\n|\r|$)/);
  const locationMatch = data.match(/LOCATION:(.*?)(?:\r?\n|\r|$)/);
  // Extract date and time information
  const startMatch = data.match(/DTSTART:(.*?)(?:\r?\n|\r|$)/);
  const endMatch = data.match(/DTEND:(.*?)(?:\r?\n|\r|$)/);
  
  const startTime = startMatch ? new Date(startMatch[1].replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6')) : undefined;
  const endTime = endMatch ? new Date(endMatch[1].replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6')) : undefined;

  
  const summary = summaryMatch ? summaryMatch[1] : 'Unknown Event';
  const location = locationMatch ? locationMatch[1] : '';
  
  return {
    type: QRCodeType.CALENDAR,
    rawData: data,
    title: 'Calendar Event',
    subtitle: summary,
    parsedData: { summary, location, startTime, endTime },
    primaryAction: {
      label: 'Add to Calendar',
      action: async () => {
        // In a real app, you'd implement calendar event creation
        await Clipboard.setString(data);
        alert('Event details copied to clipboard');
      },
    },
    secondaryActions: location ? [
      {
        icon: 'navigate-outline',
        label: 'View Location',
        action: async () => {
          await Linking.openURL(`https://maps.google.com/maps?q=${encodeURIComponent(location)}`);
        },
      }
    ] : undefined,
  };
}

// Plain text parser (fallback)
function parseText(data: string): ParsedQRCode {
  return {
    type: QRCodeType.TEXT,
    rawData: data,
    title: 'Text',
    parsedData: { text: data },
    primaryAction: {
      label: 'Copy Text',
      action: async () => {
        await Clipboard.setString(data);
      },
    },
    secondaryActions: [
      {
        icon: 'search-outline',
        label: 'Search Web',
        action: async () => {
          await Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(data)}`);
        },
      },
      {
        icon: 'share-outline',
        label: 'Share',
        action: async () => {
          await Share.share({ message: data });
        },
      }
    ],
  };
}