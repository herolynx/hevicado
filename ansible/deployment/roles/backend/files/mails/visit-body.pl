Potwierdzenie statusu Twojej wizyty.

Tytuł: $title
Wizyta w dniu: $startDate
Lekarz: $doctorDegree $doctorLastName, $doctorFirstName
Status wizyty: #if($status=="OPEN")
Otwarta
#elseif($status=="CLOSED")
Zamknięta
#elseif($status=="CANCELLED")
Anulowana
#else
$status
#end

Twoje wizyty: https://hevicado.com/#/patient/visit

Z poważaniem,
Hevicado