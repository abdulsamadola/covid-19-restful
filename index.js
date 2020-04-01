const express = require("express");
const request = require("request");
const csv = require("csvtojson");
const app = express();
function formatDate() {
  return new Date().toISOString().split("T")[0];
}
function formatDayBefore(date) {
  let day = date.split("-")[2] - 1;
  let month = date.split("-")[1];

  if (day === 0) {
    let d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth());
    d.setHours(0, 0, 0, 0);
    let lastMonthStart = new Date(d);
    day = lastMonthStart
      .toISOString()
      .split("T")[0]
      .split("-")[2];
    month = lastMonthStart
      .toISOString()
      .split("T")[0]
      .split("-")[1];
  }
  console.log("From the date===> " + day);

  const year = date.split("-")[0];
  const fullDate = `${month}-${day}-${year}`;
  console.log("After every the date===> " + fullDate);
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
app.get("/country/:name", (req, res) => {
  let countryName = req.params.name;
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
                let result = myData.find(
                  ({ Country_Region: name }) =>
                    name.toLowerCase() == countryName.toLowerCase().trim()
                );
                if (result) {
                  return res.status(200).send(JSON.stringify(result));
                } else {
                  res
                    .status(200)
                    .send(JSON.stringify({ error: "Country not found!" }));
                }
              }
            );
        } else {
          res.status(200).send(JSON.stringify(data));
        }
      }
    );
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
          res.status(200).send(JSON.stringify(data));
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
  var x = new Date();
  console.log(x.setDate(0)); // 0 will result in the last day of the previous month
  console.log(x.getMonth() + 1);
  x.setDate(1);
  let d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth());
  d.setHours(0, 0, 0, 0);
  const lastMonthStart = new Date(d);
  console.log(lastMonthStart);
});
