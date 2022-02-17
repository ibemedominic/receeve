
export interface EmailEvent
{
    signature : { 
        timestamp : string,
        token: string,
        signature : string
      };

    "event-data" : 
    {
        event : string,
        timestamp: number,
        id: string
    };
    
}
