using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

public class GoogleMapController : MonoBehaviour {

	[System.Serializable]
	public class GetAllResult {
		public string ID, UID, PRODUCT_DESC, LOCATION, SHOP_NAME, REMARK;
		public int PRICE, QUANTITY, STATUS, EDATE, COUNT;
	}

	public string ip = "folio-uranium.codio.io";
	public int port = 9600;
	public List<GetAllResult> getAllResultList;

	private DB db;

	void Awake () {
		this.db = this.GetComponent<DB> ();
	}
	void Start () {
		StartCoroutine (this.GetAll ());
	}

	private IEnumerator GetAll () {
		WWW www = this.db.GET ("https://" + this.ip + ":" + this.port + "/");
		yield return www;
		print (www.text);
		this.getAllResultList = new List<GetAllResult> ();
		List<object> listObj = MiniJSON.Json.Deserialize (www.text) as List<object>;
		foreach (object obj in listObj) {
			this.getAllResultList.Add (JsonUtility.FromJson<GetAllResult> (MiniJSON.Json.Serialize (obj)));
		}
	}
}
