# node-proxy

Universal read.me for the proxy both sides!

ON Server --->
There is a simple node service running on the RPI

Camera INFO
All the info about the cams is in folder Documents/node-proxy/
stored in a storage.json file wiht an object data;

Change old / ADD new
To change or to add more cameras 
go to Documents/node-proxy/storage.json and 
add there the new object as follows:

In the data object make a new object {}
with these properties as shown down below ( id,url,name,host)
and jthan change the values.(!NOTE: all of the attributes should be in " " quotes and all of the  values for them too " " Except for id which is without " ")
As shown below:

 "data":[
      {
        "id": 0,
        "url": "http://192.168.20.100/snapshot.cgi",
        (url of the open new/old camera in the WLAN)
        !NOTE:I
        "name": "Stairs Camera"(choose a name by prefrence),
        "host": "192.168.20.100"(And host by prefrance it can be also company.ex.com 
            not only ip adresses)
      }
    ] 
 --------------------------   
 Notes:
    For id  - just the next number on the list (1, 2, 3, 4, 5);
    For the Url - add the username and the pass of the camera(if there is one) than @ and the ip of the cam in the local network
   For the name - just a name for the camare maybe with the phisical position where it is so you dont consufe yourself
   For the host -  either the ip or a company name like company.example.com

And save the file from File - > Save

