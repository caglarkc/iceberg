export interface TopicContext {
  contactFirstName?: string;
  contactLastName?: string;
  propertyAddress?: string;
  propertyPostcode?: string;
  appointmentType?: string;
}

export function generateMeetingTopic(ctx: TopicContext): string {
  if (ctx.appointmentType === "valuation" && ctx.propertyAddress) {
    const postcode = ctx.propertyPostcode ? `, ${ctx.propertyPostcode}` : "";
    return `Valuation call — ${ctx.propertyAddress}${postcode}`;
  }
  if (ctx.appointmentType === "viewing" && ctx.propertyAddress) {
    return `Virtual viewing — ${ctx.propertyAddress}`;
  }
  if (ctx.contactFirstName && ctx.contactLastName) {
    return `Call with ${ctx.contactFirstName} ${ctx.contactLastName}`;
  }
  return "Zoom meeting";
}
