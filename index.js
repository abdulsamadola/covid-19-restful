const express = require("express");
const request = require("request");
const csv = require("csvtojson");
const app = express();
function formatDate() {
  return new Date().toISOString().split("T")[0];
}
function formatDayBefore(date) {
  let day = date.split("-")[2] - 1;
  const year = date.split("-")[0];
  const month = date.split("-")[1];
  const fullDate = `${month}-${day}-${year}`;
  return fullDate;
}
function formatToday(date) {
  let day = date.split("-")[2];
  const year = date.split("-")[0];
  const month = date.split("-")[1];
  const fullDate = `${month}-${day}-${year}`;
  return fullDate;
}
let linkURL = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/${formatToday(
  formatDate()
)}.csv`;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Corona Server is greeting you");
});

app.get("/latest", (req, res) => {
  if (!req.body) return res.status(403).send("Invalid payload");
  const dataToAccess = req.query;
  //Send Payload

  let data = [];
  csv()
    .fromStream(request.get(linkURL))
    .subscribe(
      json => {
        return new Promise((resolve, reject) => {
          //console.log(json);
          data.push(json);
          resolve();
          // long operation for each json e.g. transform / write into database.
        });
      },
      onError => {
        console.log("error", onError);
      },
      onComplete => {
        //console.log(JSON.stringify(data));
        if (data.length === 0) {
          let myData = [];
          csv()
            .fromStream(
              request.get(
                `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/${formatDayBefore(
                  formatDate()
                )}.csv`
              )
            )
            .subscribe(
              json => {
                return new Promise((resolve, reject) => {
                  //  console.log("=======> " + json);
                  myData.push(json);
                  resolve();
                  // long operation for each json e.g. transform / write into database.
                });
              },
              onError => {
                console.log("error", onError);
              },
              onComplete => {
                res.status(200).send(JSON.stringify(myData));
              }
            );
        } else {
          // res.status(200).send(JSON.stringify(data));
        }
      }
    );

  //res.status(200).send(JSON.stringify(data));
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running...");
  console.log("A day before", formatDayBefore(formatDate()));
  console.log("Today", formatDate());
  console.log("Link UL", linkURL);
});
