-- =====================================================================
-- Freightline: starter content. Everything here is editable from /admin.
-- Run AFTER migrations/0001_schema.sql. Safe to re-run on an empty database.
-- =====================================================================

insert into public.site_settings (key, value) values
('brand', jsonb_build_object(
  'name', 'Freightline',
  'tagline', 'Freight and logistics, Coimbatore',
  'phone', '+91 96004 59889',
  'whatsapp', '919600459889',
  'email', 'hello@freightline.example',
  'address', 'Avinashi Road, Coimbatore, Tamil Nadu 641018',
  'hours', 'Mon to Sat, 8:00 am to 8:00 pm IST'
)),
('hero', jsonb_build_object(
  'headline', E'South India''s freight,\nrun like a timetable.',
  'subheadline', 'Full truckload, part load and warehousing across 150+ cities. Every consignment is tracked from pickup to proof of delivery.',
  'primary_cta', 'Get a quote',
  'secondary_cta', 'See our network',
  'tracking_label', 'Track a consignment',
  'tracking_placeholder', 'Enter tracking code'
)),
('sections', jsonb_build_object(
  'clients_title', 'Trusted by manufacturers, retailers and exporters',
  'services_title', 'Every kind of freight, one accountable team',
  'services_subtitle', 'Pick a single service or let us run your whole inbound and outbound chain.',
  'stats_title', 'Numbers our customers audit',
  'network_title', 'Lanes that leave on schedule',
  'network_subtitle', 'Fixed departures between our hubs, so you can plan around them.',
  'fleet_title', 'A fleet sized for the load',
  'fleet_subtitle', 'GPS-tracked vehicles, maintained in-house and driven by verified crews.',
  'process_title', 'From booking to proof of delivery',
  'process_subtitle', 'Five checkpoints, each one visible to you.',
  'testimonials_title', 'What operations teams say',
  'faq_title', 'Questions we hear before the first booking',
  'quote_title', 'Tell us what needs to move',
  'quote_subtitle', 'Share the lane and the load. A logistics manager replies within two working hours with a firm quote.',
  'contact_title', 'Talk to a person',
  'newsletter_title', 'Freight notes, once a month',
  'newsletter_subtitle', 'Rate trends, route advisories and compliance updates. No filler.'
)),
('footer', jsonb_build_object(
  'about', 'Freightline moves industrial and consumer cargo across India with fixed lanes, live tracking and one point of contact.',
  'legal', 'All rights reserved.',
  'gst', 'GSTIN: 33ABCDE1234F1Z5'
)),
('seo', jsonb_build_object(
  'title', 'Freightline | Freight and logistics across India',
  'description', 'Full truckload, part load, warehousing and express freight from Coimbatore to 150+ cities. Live tracking and fixed lanes.'
)),
('social', jsonb_build_object(
  'linkedin', 'https://www.linkedin.com/',
  'instagram', 'https://www.instagram.com/',
  'youtube', 'https://www.youtube.com/',
  'x', 'https://x.com/'
))
on conflict (key) do nothing;

insert into public.services (slug, title, summary, icon, features, sort_order) values
('full-truckload', 'Full truckload', 'Dedicated vehicles from 7 to 32 tonnes, point to point, with live GPS and sealed handover.', 'Truck',
  array['Dedicated vehicle and driver','Live GPS and geofence alerts','E-way bill and LR handled'], 1),
('part-load', 'Part load', 'Share a truck, not the risk. Consolidated lanes with fixed weekly departures.', 'Boxes',
  array['Pay only for the space you use','Hub-to-hub fixed departures','Pallet-level scan events'], 2),
('warehousing', 'Warehousing and fulfilment', 'Racked storage, cross-docking and pick-pack in Coimbatore, Chennai and Bengaluru.', 'Warehouse',
  array['WMS with real-time stock view','Cross-dock in under 6 hours','Bonded and open yard space'], 3),
('cold-chain', 'Cold chain', 'Temperature-controlled transport for food, pharma and agri produce, logged end to end.', 'Snowflake',
  array['-25 C to +25 C range','Data-logger reports per trip','Pre-cooled vehicles'], 4),
('project-cargo', 'Project and ODC cargo', 'Over-dimensional machinery moved with route surveys, permits and escorts.', 'Container',
  array['Route survey and permits','Hydraulic trailers up to 60 tonnes','On-site loading supervision'], 5),
('express', 'Express freight', 'Time-definite delivery for urgent spares and high-value consignments.', 'Gauge',
  array['Team-driver relay','Next-day on major lanes','Priority exception handling'], 6)
on conflict (slug) do nothing;

insert into public.fleet_vehicles (name, category, capacity_tons, description, features, sort_order) values
('Light commercial vehicle', 'Last-mile', 1.5, 'Intra-city and short-haul deliveries for retail and e-commerce.', array['Closed body','GPS tracked'], 1),
('Medium duty truck 14 ft', 'Regional', 4, 'Regional movement of palletised goods and machinery spares.', array['Tail-lift option','Tarpaulin cover'], 2),
('Container truck 32 ft', 'Long haul', 14, 'Single and multi-axle containers for long-haul manufacturing freight.', array['Lockable container','Sealed handover'], 3),
('Multi-axle trailer', 'Heavy haul', 28, 'High-capacity linehaul between hubs.', array['Air suspension','Dual driver relay'], 4),
('Reefer truck', 'Cold chain', 9, 'Temperature-controlled body with continuous data logging.', array['-25 C to +25 C','Pre-trip cooling'], 5),
('Hydraulic trailer', 'Project cargo', 60, 'Over-dimensional and heavy machinery movement.', array['Modular axles','Escort support'], 6)
on conflict do nothing;

insert into public.locations (name, state, latitude, longitude, is_hub, sort_order) values
('Coimbatore', 'Tamil Nadu', 11.0168, 76.9558, true, 1),
('Chennai', 'Tamil Nadu', 13.0827, 80.2707, true, 2),
('Bengaluru', 'Karnataka', 12.9716, 77.5946, true, 3),
('Hyderabad', 'Telangana', 17.3850, 78.4867, false, 4),
('Mumbai', 'Maharashtra', 19.0760, 72.8777, true, 5),
('Pune', 'Maharashtra', 18.5204, 73.8567, false, 6),
('Delhi NCR', 'Delhi', 28.6139, 77.2090, true, 7),
('Kolkata', 'West Bengal', 22.5726, 88.3639, true, 8),
('Ahmedabad', 'Gujarat', 23.0225, 72.5714, false, 9),
('Kochi', 'Kerala', 9.9312, 76.2673, false, 10),
('Madurai', 'Tamil Nadu', 9.9252, 78.1198, false, 11),
('Jaipur', 'Rajasthan', 26.9124, 75.7873, false, 12)
on conflict do nothing;

insert into public.routes (from_location_id, to_location_id, transit_hours, label, sort_order)
select f.id, t.id, r.hours, r.label, r.ord
from (values
  ('Coimbatore','Chennai', 9, 'Daily departure', 1),
  ('Coimbatore','Bengaluru', 7, 'Daily departure', 2),
  ('Coimbatore','Kochi', 4, 'Daily departure', 3),
  ('Coimbatore','Madurai', 4, 'Daily departure', 4),
  ('Bengaluru','Hyderabad', 10, 'Daily departure', 5),
  ('Bengaluru','Mumbai', 18, 'Daily departure', 6),
  ('Chennai','Hyderabad', 11, 'Mon, Wed, Fri', 7),
  ('Mumbai','Pune', 3, 'Twice daily', 8),
  ('Mumbai','Ahmedabad', 9, 'Daily departure', 9),
  ('Mumbai','Delhi NCR', 24, 'Daily departure', 10),
  ('Delhi NCR','Jaipur', 5, 'Daily departure', 11),
  ('Delhi NCR','Kolkata', 30, 'Tue, Thu, Sat', 12)
) as r(from_name, to_name, hours, label, ord)
join public.locations f on f.name = r.from_name
join public.locations t on t.name = r.to_name;

insert into public.stats (label, value, prefix, suffix, sort_order) values
('Cities served', 150, '', '+', 1),
('On-time deliveries', 98.4, '', '%', 2),
('Consignments moved yearly', 120000, '', '+', 3),
('GPS-tracked vehicles', 480, '', '', 4)
on conflict do nothing;

insert into public.process_steps (title, description, icon, sort_order) values
('Book', 'Share the lane, load and pickup window. You receive a firm quote and a booking reference.', 'FileCheck', 1),
('Pickup', 'A verified driver collects the load. Weight, seal number and photos are logged at the dock.', 'Package', 2),
('Linehaul', 'Your consignment moves on a fixed lane. GPS pings and hub scans update tracking automatically.', 'Route', 3),
('Delivery', 'The consignee signs against an OTP. Exceptions are escalated to your account manager at once.', 'MapPin', 4),
('Proof and billing', 'E-POD, LR and invoice reach you the same day, ready for reconciliation.', 'ShieldCheck', 5)
on conflict do nothing;

insert into public.testimonials (author_name, author_role, company, quote, rating, sort_order) values
('Meenakshi R.', 'Head of Supply Chain', 'Textile manufacturer, Tiruppur', 'Our dispatch-to-delivery variance dropped from two days to a few hours. The lane schedule is the first one we have been able to plan around.', 5, 1),
('Arun K.', 'Plant Manager', 'Pump manufacturer, Coimbatore', 'ODC movement used to mean weeks of coordination. Their route survey and permit team handled everything.', 5, 2),
('Farhan S.', 'Operations Lead', 'D2C retailer, Bengaluru', 'Pallet-level scans mean we know exactly where each SKU is. Reconciliation takes minutes now.', 5, 3),
('Divya P.', 'Logistics Manager', 'Food processor, Madurai', 'Temperature logs arrive with every reefer trip. Our audits have never been easier.', 5, 4),
('Rakesh M.', 'Director', 'Auto components exporter, Chennai', 'They treat a delayed truck as their problem. We hear about it before our customer does.', 4, 5)
on conflict do nothing;

insert into public.faqs (question, answer, sort_order) values
('How quickly can I get a quote?', 'Quote requests are answered by a logistics manager within two working hours, Monday to Saturday.', 1),
('Do you handle e-way bills and LR documents?', 'Yes. We generate the e-way bill and lorry receipt for every consignment and share them digitally before pickup.', 2),
('How does shipment tracking work?', 'Every consignment gets a tracking code. Enter it on this page to see its status, last known location and event history.', 3),
('Can you move over-dimensional cargo?', 'Yes. Our project cargo team runs a route survey, arranges permits and escorts, and supervises loading on site.', 4),
('What if a delivery is delayed?', 'Delays are flagged on your tracking page and escalated to your account manager, who contacts you with a revised ETA.', 5),
('Do you offer warehousing?', 'We operate racked and open-yard facilities in Coimbatore, Chennai and Bengaluru with real-time stock visibility.', 6)
on conflict do nothing;

insert into public.clients (name, sort_order) values
('Lakshmi Textiles', 1), ('Kovai Pumps', 2), ('GreenLeaf Foods', 3), ('Sundaram Auto', 4),
('Bluewave Retail', 5), ('Precision Castings', 6), ('NorthStar Pharma', 7), ('Coastal Exports', 8)
on conflict do nothing;

-- Demo shipment so the tracking widget works immediately (code: FLDEMO001)
with s as (
  insert into public.shipments (tracking_code, origin, destination, customer_name, status, eta)
  values ('FLDEMO001', 'Coimbatore', 'Chennai', 'Demo customer', 'in_transit', now() + interval '6 hours')
  on conflict (tracking_code) do nothing
  returning id
)
insert into public.shipment_events (shipment_id, status, location, description, occurred_at)
select s.id, e.status, e.location, e.description, now() - e.ago
from s, (values
  ('booked', 'Coimbatore', 'Booking confirmed', interval '20 hours'),
  ('picked_up', 'Coimbatore', 'Picked up from consignor', interval '14 hours'),
  ('in_transit', 'Salem', 'Departed Salem checkpoint', interval '5 hours')
) as e(status, location, description, ago);

-- =====================================================================
-- Make yourself an admin (after creating a user in Authentication -> Users):
--   insert into public.admin_users (user_id, email)
--   select id, email from auth.users where email = 'you@yourcompany.com';
-- =====================================================================
